// File: ogs-client/depot/electron/services/supabase.js
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import { eq } from "drizzle-orm";
import process from "process";
import { getDb } from "../db/db.js";
import * as schema from "../db/schema.js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("Supabase credentials missing. Sync will be disabled.");
}

export const syncService = {
  // Check connection
  async checkConnection() {
    if (!supabase) return false;
    try {
      const { error } = await supabase
        .from("sales")
        .select("count", { count: "exact", head: true });
      return !error;
    } catch (e) {
      console.error("Sync connection check failed:", e);
      return false;
    }
  },

  // Push local changes to cloud
  async pushChanges() {
    if (!supabase) return { success: false, error: "No credentials" };

    const db = getDb();

    // --- SYNC PRODUCTS (FIRST) ---
    let productsToSync = [];
    try {
      productsToSync = db
        .select()
        .from(schema.products)
        .where(eq(schema.products.syncStatus, "pending"))
        .limit(50) // Process in smaller batches
        .all();
    } catch (e) {
      console.error("Error selecting products:", e);
    }

    let productsCount = 0;
    if (productsToSync.length > 0) {
      console.log(`Pushing ${productsToSync.length} products to cloud...`);
      const payload = productsToSync.map((p) => ({
        id: p.id,
        name: p.name,
        barcode: p.barcode,
        price: p.price,
        stock: p.stock,
        category: p.category,
        created_at: p.createdAt,
        updated_at: p.updatedAt,
        deleted_at: p.deletedAt, // Sync deletion status
      }));

      const { error } = await supabase.from("products").upsert(payload);

      if (error) {
        console.error("Supabase Product Push Error:", error);
      } else {
        db.transaction((tx) => {
          for (const prod of productsToSync) {
            tx.update(schema.products)
              .set({ syncStatus: "synced", lastSyncedAt: new Date() })
              .where(eq(schema.products.id, prod.id))
              .run();
          }
        });
        productsCount = productsToSync.length;
      }
    }

    // --- SYNC SALES (SECOND) ---
    // Sync sales AFTER products to ensure FK integrity
    let salesToSync = [];
    try {
      salesToSync = db
        .select()
        .from(schema.sales)
        .where(eq(schema.sales.syncStatus, "pending"))
        .limit(50) // Process in smaller batches
        .all();
    } catch (e) {
      console.error("Error selecting sales:", e);
    }

    let salesCount = 0;
    if (salesToSync.length > 0) {
      console.log(`Pushing ${salesToSync.length} sales to cloud...`);

      // 1. Fetch related items for these sales
      const saleIds = salesToSync.map((s) => s.id);
      let saleItemsToSync = [];
      try {
        // Fetch all items belonging to these sales
        // better-sqlite3 doesn't support 'IN' array easily in select builder with drizzle
        // efficiently without tweaking, so we loop or query raw if needed.
        // But Drizzle 'inArray' works fine.
        const { inArray } = await import("drizzle-orm");

        saleItemsToSync = db
          .select()
          .from(schema.saleItems)
          .where(inArray(schema.saleItems.saleId, saleIds))
          .all();
      } catch (e) {
        console.error("Error fetching sale items for sync:", e);
        // If we can't get items, we shouldn't sync the sales headers to avoid data inconsistency?
        // For now, we proceed but log error. Ideally we abort.
      }

      // 2. Prepare Payloads
      const salesPayload = salesToSync.map((s) => ({
        id: s.id,
        total_amount: s.totalAmount,
        status: s.status,
        payment_method: s.paymentMethod || "Cash",
        created_at: s.createdAt,
        deleted_at: s.deletedAt,
      }));

      const itemsPayload = saleItemsToSync.map((i) => ({
        id: i.id,
        sale_id: i.saleId,
        product_id: i.productId,
        quantity: i.quantity,
        price_at_sale: i.priceAtSale,
        deleted_at: i.deletedAt,
      }));

      // 3. Upsert Sales Headers
      // SAFETY CHECK: If items fetch failed (0 items for multiple sales), we should ABORT
      if (saleItemsToSync.length === 0 && salesToSync.length > 0) {
        console.error("Critical: Could not fetch items for sales. Aborting sync to prevent data corruption.");
        return { success: false, error: "Items fetch failure" };
      }

      const { error: salesError } = await supabase
        .from("sales")
        .upsert(salesPayload);

      if (salesError) {
        console.error("Supabase Sales Push Error:", salesError);
      } else {
        // 4. Upsert Sale Items
        // We do this AFTER sales header to ensure referential integrity if foreign keys are enforced
        let itemsError = null;
        if (itemsPayload.length > 0) {
          const { error } = await supabase
            .from("sale_items")
            .upsert(itemsPayload);
          itemsError = error;
        }

        if (itemsError) {
          console.error("Supabase Sale Items Push Error:", itemsError);
          // Decide: do we mark sales as synced if items failed?
          // NO. That causes missing data. We do NOT update local DB sync_status.
        } else {
          // Success! Mark as synced
          db.transaction((tx) => {
            for (const sale of salesToSync) {
              tx.update(schema.sales)
                .set({ syncStatus: "synced", lastSyncedAt: new Date() })
                .where(eq(schema.sales.id, sale.id))
                .run();
            }
          });
          salesCount = salesToSync.length;
        }
      }
    }

    return {
      success: true,
      pushedSales: salesCount,
      pushedProducts: productsCount,
      hasMore: productsToSync.length === 50 || salesToSync.length === 50
    };
  },

  // Pull changes from cloud
  async pullChanges() {
    if (!supabase) return { success: false, error: "No credentials" };
    const db = getDb();

    try {
      let totalPulledProducts = 0;
      let totalPulledSales = 0;
      let totalPulledItems = 0;
      let hasMore = false;

      // --- 1. PULL PRODUCTS ---
      const productCheckpoint = db
        .select()
        .from(schema.syncState)
        .where(eq(schema.syncState.key, "last_pulled_products_at"))
        .get();
      
      let lastPulledProductsAt = productCheckpoint
        ? productCheckpoint.value
        : new Date(0).toISOString();

      const { data: remoteProducts, error: prodError } = await supabase
        .from("products")
        .select("*")
        .gt("updated_at", lastPulledProductsAt)
        .order("updated_at", { ascending: true })
        .limit(100);

      if (prodError) throw prodError;

      if (remoteProducts && remoteProducts.length > 0) {
        db.transaction((tx) => {
          for (const remote of remoteProducts) {
            const local = tx
              .select()
              .from(schema.products)
              .where(eq(schema.products.id, remote.id))
              .get();

            let shouldUpdate = true;
            if (local) {
              const localTime = new Date(local.updatedAt).getTime();
              const remoteTime = new Date(remote.updated_at).getTime();
              if (localTime >= remoteTime) shouldUpdate = false;
            }

            if (shouldUpdate) {
              const productData = {
                id: remote.id,
                name: remote.name,
                barcode: remote.barcode,
                price: remote.price,
                stock: remote.stock,
                category: remote.category,
                updatedAt: new Date(remote.updated_at),
                createdAt: new Date(remote.created_at),
                deletedAt: remote.deleted_at ? new Date(remote.deleted_at) : null,
                syncStatus: "synced",
                lastSyncedAt: new Date(),
              };

              tx.insert(schema.products)
                .values(productData)
                .onConflictDoUpdate({ target: schema.products.id, set: productData })
                .run();
              totalPulledProducts++;
            }
          }
          const latest = remoteProducts[remoteProducts.length - 1].updated_at;
          tx.insert(schema.syncState)
            .values({ key: "last_pulled_products_at", value: latest, updatedAt: new Date() })
            .onConflictDoUpdate({ target: schema.syncState.key, set: { value: latest, updatedAt: new Date() } })
            .run();
        });
        if (remoteProducts.length === 100) hasMore = true;
      }

      // --- 2. PULL SALES ---
      const salesCheckpoint = db
        .select()
        .from(schema.syncState)
        .where(eq(schema.syncState.key, "last_pulled_sales_at"))
        .get();
      
      let lastPulledSalesAt = salesCheckpoint
        ? salesCheckpoint.value
        : new Date(0).toISOString();

      const { data: remoteSales, error: salesError } = await supabase
        .from("sales")
        .select("*")
        .gt("created_at", lastPulledSalesAt)
        .order("created_at", { ascending: true })
        .limit(100);

      if (salesError) throw salesError;

      if (remoteSales && remoteSales.length > 0) {
        db.transaction((tx) => {
          for (const remote of remoteSales) {
            const saleData = {
              id: remote.id,
              totalAmount: remote.total_amount,
              paymentMethod: remote.payment_method,
              status: remote.status,
              createdAt: new Date(remote.created_at),
              deletedAt: remote.deleted_at ? new Date(remote.deleted_at) : null,
              syncStatus: "synced",
              lastSyncedAt: new Date(),
            };

            tx.insert(schema.sales)
              .values(saleData)
              .onConflictDoUpdate({ target: schema.sales.id, set: saleData })
              .run();
            totalPulledSales++;
          }
          const latest = remoteSales[remoteSales.length - 1].created_at;
          tx.insert(schema.syncState)
            .values({ key: "last_pulled_sales_at", value: latest, updatedAt: new Date() })
            .onConflictDoUpdate({ target: schema.syncState.key, set: { value: latest, updatedAt: new Date() } })
            .run();
        });
        if (remoteSales.length === 100) hasMore = true;
      }

      // --- 3. PULL SALE ITEMS ---
      const itemsCheckpoint = db
        .select()
        .from(schema.syncState)
        .where(eq(schema.syncState.key, "last_pulled_items_at"))
        .get();
      
      let lastPulledItemsAt = itemsCheckpoint ? itemsCheckpoint.value : "0";

      const { data: remoteItems, error: itemsError } = await supabase
        .from("sale_items")
        .select("*")
        .limit(200);

      if (itemsError) throw itemsError;

      if (remoteItems && remoteItems.length > 0) {
        db.transaction((tx) => {
          for (const remote of remoteItems) {
            const itemData = {
              id: remote.id,
              saleId: remote.sale_id,
              productId: remote.product_id,
              quantity: remote.quantity,
              priceAtSale: remote.price_at_sale,
              deletedAt: remote.deleted_at ? new Date(remote.deleted_at) : null,
            };
            tx.insert(schema.saleItems)
              .values(itemData)
              .onConflictDoUpdate({ target: schema.saleItems.id, set: itemData })
              .run();
            totalPulledItems++;
          }
        });
      }

      return { success: true, pulledProducts: totalPulledProducts, pulledSales: totalPulledSales, pulledItems: totalPulledItems, hasMore };
    } catch (e) {
      console.error("Pull Changes Exception:", e);
      return { success: false, error: e.message };
    }
  },
};
