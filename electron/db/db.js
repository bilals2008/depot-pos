// File: ogs-client/depot/electron/db/db.js
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { eq, and, gte, lte, desc, sql, inArray, isNull } from 'drizzle-orm';

export function getSales(startDate, endDate) {
  const db = getDb();
  
  // Create date objects for start and end of the period
  const start = new Date(startDate);
  const end = new Date(endDate);

  return db.select()
    .from(schema.sales)
    .where(
      and(
        gte(schema.sales.createdAt, start),
        lte(schema.sales.createdAt, end),
        isNull(schema.sales.deletedAt)
      )
    )
    .orderBy(desc(schema.sales.createdAt))
    .all();
}

// getAllSales REMOVED (Performance/OOM Risk)

export function getSalesPaginated({ page = 1, pageSize = 13, sortBy = 'date', sortOrder = 'desc', searchTerm = '' }) {
    const db = getDb();
    const offset = (page - 1) * pageSize;
    
    // Build Where Clause
    let filters = [isNull(schema.sales.deletedAt)];
    if (searchTerm) {
        const term = `%${searchTerm}%`;
        filters.push(sql`${schema.sales.id} LIKE ${term}`);
    }
    const whereClause = and(...filters);

    // Determine Sort
    let orderByClause = desc(schema.sales.createdAt);
    if (sortBy === 'total') {
        orderByClause = sortOrder === 'asc' ? schema.sales.totalAmount : desc(schema.sales.totalAmount);
    } else if (sortBy === 'status') {
         orderByClause = sortOrder === 'asc' ? schema.sales.status : desc(schema.sales.status);
    } else if (sortBy === 'id') {
         orderByClause = sortOrder === 'asc' ? schema.sales.id : desc(schema.sales.id);
    } else {
        // default date
         orderByClause = sortOrder === 'asc' ? schema.sales.createdAt : desc(schema.sales.createdAt);
    }

    // 1. Get Totals (for pagination)
    const countResult = db.select({ count: sql`count(*)` })
                          .from(schema.sales)
                          .where(whereClause)
                          .get();
    const totalCount = countResult ? countResult.count : 0;

    // 2. Get Page Data
    const salesPage = db.select()
        .from(schema.sales)
        .where(whereClause)
        .limit(pageSize)
        .offset(offset)
        .orderBy(orderByClause)
        .all();

    if (salesPage.length === 0) {
        return { sales: [], totalCount };
    }

    // 3. Fetch Items for THIS PAGE ONLY
    // We only need items for the 13 sales we just fetched.
    const saleIds = salesPage.map(s => s.id);
    
    const items = db.select({
        saleId: schema.saleItems.saleId,
        productId: schema.saleItems.productId,
        quantity: schema.saleItems.quantity,
        price: schema.saleItems.priceAtSale,
        productName: schema.products.name
    })
    .from(schema.saleItems)
    .leftJoin(schema.products, eq(schema.saleItems.productId, schema.products.id))
    .where(inArray(schema.saleItems.saleId, saleIds))
    .all();

    // 4. Map
    const mappedSales = salesPage.map(sale => {
        const saleItems = items.filter(item => item.saleId === sale.id).map(item => ({
            id: item.productId,
            name: item.productName || 'Unknown Product',
            quantity: item.quantity,
            price: item.price
        }));
        
        return {
            ...sale,
            date: sale.createdAt,
            total: sale.totalAmount,
            status: sale.status || "Completed",
            items: saleItems
        };
    });

    return { sales: mappedSales, totalCount };
}
import * as schema from './schema.js';
import path from 'path';
import fs from 'fs';

let db;

export function initDb(userDataPath) {
  if (db) return db;

  const dbPath = path.join(userDataPath, 'database.sqlite');
  
  // Ensure directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  console.log('Initializing database at:', dbPath);
  const sqlite = new Database(dbPath);
  db = drizzle(sqlite, { schema });

  // Enable WAL mode for better concurrency
  sqlite.pragma('journal_mode = WAL');

  // Temporary: Auto-create tables 
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      barcode TEXT UNIQUE,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      category TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      total_amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      status TEXT DEFAULT 'Completed',
      created_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL REFERENCES sales(id),
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity INTEGER NOT NULL,
      price_at_sale REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stock_history (
      id TEXT PRIMARY KEY,
      product_id TEXT,
      product_name TEXT,
      previous_stock INTEGER,
      current_stock INTEGER,
      change_amount INTEGER,
      reason TEXT,
      created_at INTEGER
    );
    CREATE TABLE IF NOT EXISTS sync_state (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER
    );
  `);

  // Migration: Add status column if it doesn't exist
  try {
    const columns = sqlite.pragma('table_info(sales)');
    const hasStatus = columns.some(c => c.name === 'status');
    if (!hasStatus) {
        console.log("Migrating database: Adding status column to sales table...");
        sqlite.exec(`ALTER TABLE sales ADD COLUMN status TEXT DEFAULT 'Completed'`);
    }
  } catch (e) {
      console.error("Migration failed:", e);
  }

  // Migration: Add Sync Columns
  try {
      const tablesToCheck = ['products', 'sales', 'stock_history'];
      for (const tableName of tablesToCheck) {
          const columns = sqlite.pragma(`table_info(${tableName})`);
          
          if (!columns.some(c => c.name === 'sync_status')) {
              sqlite.exec(`ALTER TABLE ${tableName} ADD COLUMN sync_status TEXT DEFAULT 'pending'`);
          }
          if (!columns.some(c => c.name === 'last_synced_at')) {
              sqlite.exec(`ALTER TABLE ${tableName} ADD COLUMN last_synced_at INTEGER`);
          }
          if (tableName === 'products' && !columns.some(c => c.name === 'deleted_at')) {
              sqlite.exec(`ALTER TABLE ${tableName} ADD COLUMN deleted_at INTEGER`);
          }
          if (!columns.some(c => c.name === 'updated_at')) {
              sqlite.exec(`ALTER TABLE ${tableName} ADD COLUMN updated_at INTEGER`);
          }
      }
      console.log("Sync migration completed.");
  } catch (e) {
      console.error("Sync migration failed:", e);
  }

  // Soft Delete Migrations for Sales
  try {
    sqlite.exec(`
      ALTER TABLE sales ADD COLUMN deleted_at INTEGER;
      ALTER TABLE sale_items ADD COLUMN deleted_at INTEGER;
    `);
    console.log("Sales soft-delete migration completed.");
  } catch {
    // Column might already exist
  }

  // Create Indices
  try {
    sqlite.exec(`
      CREATE INDEX IF NOT EXISTS products_updated_at_idx ON products(updated_at);
      CREATE INDEX IF NOT EXISTS products_barcode_idx ON products(barcode);
      CREATE INDEX IF NOT EXISTS products_sync_status_idx ON products(sync_status);
      CREATE INDEX IF NOT EXISTS sales_created_at_idx ON sales(created_at);
      CREATE INDEX IF NOT EXISTS sales_sync_status_idx ON sales(sync_status);
      CREATE INDEX IF NOT EXISTS sale_items_sale_id_idx ON sale_items(sale_id);
      CREATE INDEX IF NOT EXISTS sale_items_product_id_idx ON sale_items(product_id);
    `);
    console.log("Indices verified/created.");
  } catch (e) {
    console.error("Failed to create indices:", e);
  }

  return db;
}


export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb first.');
  }
  return db;
}

// --- CRUD Helpers --- //

export function getAllProducts() {
  const db = getDb();
  return db.select()
    .from(schema.products)
    .where(sql`${schema.products.deletedAt} IS NULL`)
    .orderBy(desc(schema.products.createdAt))
    .all();
}


export function addProduct(productData) {
  const db = getDb();
  // Initial stock log
  db.transaction((tx) => {
      tx.insert(schema.products).values(productData).run();
      
      if (productData.stock > 0) {
          tx.insert(schema.stockHistory).values({
              id: crypto.randomUUID(),
              productId: productData.id,
              productName: productData.name,
              previousStock: 0,
              currentStock: productData.stock,
              changeAmount: productData.stock,
              reason: "Initial Stock",
              createdAt: new Date()
          }).run();
      }
  });
  return { success: true };
}

export function createSale(saleData) {
  // saleData: { id, totalAmount, paymentMethod, items: [{ productId, quantity, priceAtSale }] }
  const db = getDb();
  
  // Use transaction to ensure data integrity
  return db.transaction((tx) => {
    // 1. Create Sale Record
    tx.insert(schema.sales).values({
      id: saleData.id,
      totalAmount: saleData.totalAmount,
      paymentMethod: saleData.paymentMethod,
      createdAt: new Date()
    }).run();

    // 2. Insert Sale Items
    for (const item of saleData.items) {
      tx.insert(schema.saleItems).values({
        id: crypto.randomUUID(), // Generate a unique ID for the item entry
        saleId: saleData.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtSale: item.price
      }).run();

      // 3. Update Stock & Log History
      // Fetch current product to get name and current stock
      const product = tx.select().from(schema.products).where(eq(schema.products.id, item.productId)).get();
      
      if (product) {
          const previousStock = product.stock;
          
          if (previousStock < item.quantity) {
              throw new Error(`Insufficient stock for product: ${product.name}`);
          }

          const currentStock = previousStock - item.quantity;

          tx.update(schema.products)
            .set({ 
              stock: currentStock,
              syncStatus: 'pending'
            })
            .where(eq(schema.products.id, item.productId))
            .run();
            
          // Log to History
          tx.insert(schema.stockHistory).values({
              id: crypto.randomUUID(),
              productId: product.id,
              productName: product.name,
              previousStock: previousStock,
              currentStock: currentStock,
              changeAmount: -item.quantity,
              reason: `Sale #${saleData.id}`,
              createdAt: new Date()
          }).run();
      }
    }

    return { success: true, id: saleData.id };
  });
}

// ... (createSale replacement to ensure status is set is redundant if default is there, but good practice to be explicit if using schema)
// Actually I don't need to change createSale if I rely on default value, but schema has default.

export function processReturn({ saleId, returnedItems, exchangeItems, returnMode, reason }) {
  const db = getDb();

  return db.transaction((tx) => {
      // 1. Update Sale Status
      const status = returnMode === 'cash' ? 'Returned' : 'Exchanged';
      tx.update(schema.sales)
        .set({ 
            status,
            syncStatus: 'pending', // Trigger sync
            updatedAt: new Date()
        })
        .where(eq(schema.sales.id, saleId))
        .run();

      // 2. Handle Returned Items (Restock)
      for (const item of returnedItems) {
          // item: { id: productId, quantity }
          const product = tx.select().from(schema.products).where(eq(schema.products.id, item.id)).get();
          if (product) {
              const previousStock = product.stock;
              const currentStock = previousStock + item.quantity;
              
              tx.update(schema.products)
                  .set({ 
                      stock: currentStock,
                      syncStatus: 'pending', // Trigger sync
                      updatedAt: new Date()
                  })
                  .where(eq(schema.products.id, item.id))
                  .run();

              // Log History
              tx.insert(schema.stockHistory).values({
                  id: crypto.randomUUID(),
                  productId: product.id,
                  productName: product.name,
                  previousStock: previousStock,
                  currentStock: currentStock,
                  changeAmount: item.quantity,
                  reason: `Return: ${reason} (Sale #${saleId})`,
                  createdAt: new Date(),
                  syncStatus: 'pending' // Trigger sync for history too (if we sync history later)
              }).run();
          }
      }

      // 3. Handle Exchange Items (Deduct Stock)
      if (returnMode === 'exchange' && exchangeItems && exchangeItems.length > 0) {
          for (const item of exchangeItems) {
              // item: { id: productId, quantity }
              const product = tx.select().from(schema.products).where(eq(schema.products.id, item.id)).get();
              if (product) {
                  const previousStock = product.stock;
                  const currentStock = previousStock - item.quantity;

                  tx.update(schema.products)
                      .set({ 
                          stock: currentStock,
                          syncStatus: 'pending', // Trigger sync
                          updatedAt: new Date()
                      })
                      .where(eq(schema.products.id, item.id))
                      .run();

                  // Log History
                  tx.insert(schema.stockHistory).values({
                      id: crypto.randomUUID(),
                      productId: product.id,
                      productName: product.name,
                      previousStock: previousStock,
                      currentStock: currentStock,
                      changeAmount: -item.quantity,
                      reason: `Exchange: ${reason} (Sale #${saleId})`,
                      createdAt: new Date(),
                      syncStatus: 'pending'
                  }).run();
              }
          }
      }

      return { success: true };
  });
}


export function updateProduct(productData) {
  const db = getDb();
  const { id, name, barcode, price, stock, category } = productData;
  
  return db.transaction((tx) => {
      // Get previous state
      const oldProduct = tx.select().from(schema.products).where(eq(schema.products.id, id)).get();
      
      tx.update(schema.products)
        .set({ 
          name, 
          barcode, 
          price, 
          stock, 
          category, 
          updatedAt: new Date() 
        })
        .where(eq(schema.products.id, id))
        .run();
        
      // Log stock change if any
      if (oldProduct && oldProduct.stock !== stock) {
          const change = stock - oldProduct.stock;
          tx.insert(schema.stockHistory).values({
              id: crypto.randomUUID(),
              productId: id,
              productName: name, // Use new name
              previousStock: oldProduct.stock,
              currentStock: stock,
              changeAmount: change,
              reason: "Manual Adjustment",
              createdAt: new Date()
          }).run();
      }
  });
}

export function deleteSale(saleId) {
    const db = getDb();

    return db.transaction((tx) => {
        // 1. Get items to revert stock
        const items = tx.select().from(schema.saleItems).where(eq(schema.saleItems.saleId, saleId)).all();

        // 2. Revert stock
        for (const item of items) {
            const product = tx.select().from(schema.products).where(eq(schema.products.id, item.productId)).get();
            if (product) {
                tx.update(schema.products)
                    .set({ 
                        stock: product.stock + item.quantity,
                        updatedAt: new Date(),
                        syncStatus: 'pending' // Mark for sync
                    })
                    .where(eq(schema.products.id, item.productId))
                    .run();

                // Log stock history
                tx.insert(schema.stockHistory).values({
                    id: crypto.randomUUID(),
                    productId: item.productId,
                    productName: product.name,
                    previousStock: product.stock,
                    currentStock: product.stock + item.quantity,
                    changeAmount: item.quantity,
                    reason: `Sale ${saleId} deleted`,
                    createdAt: new Date()
                }).run();
            }
        }

        // 3. Soft Delete items
        tx.update(schema.saleItems)
            .set({ deletedAt: new Date() })
            .where(eq(schema.saleItems.saleId, saleId))
            .run();

        // 4. Soft Delete sale
        tx.update(schema.sales)
            .set({ 
                deletedAt: new Date(),
                syncStatus: 'pending' 
            })
            .where(eq(schema.sales.id, saleId))
            .run();

        return { success: true };
    });
}

export function getStockHistory() {
    const db = getDb();
    return db.select().from(schema.stockHistory).orderBy(desc(schema.stockHistory.createdAt)).all();
}



// Soft delete to preserve history
export function deleteProduct(id) {
  const db = getDb();
  
  return db.transaction((tx) => {
      // 1. Check if product exists
      const product = tx.select().from(schema.products).where(eq(schema.products.id, id)).get();
      if (!product) return { success: false, message: "Product not found" };

      // 2. Mark as deleted instead of removing
      tx.update(schema.products)
        .set({ 
            deletedAt: new Date(),
            syncStatus: 'pending' // Mark for sync deletion
        })
        .where(eq(schema.products.id, id))
        .run();
      
      // 3. Log deletion in stock history for audit
      tx.insert(schema.stockHistory).values({
          id: crypto.randomUUID(),
          productId: id,
          productName: product.name,
          previousStock: product.stock,
          currentStock: 0,
          changeAmount: -product.stock,
          reason: "Product Deleted",
          createdAt: new Date()
      }).run();

      return { success: true };
  });
}


