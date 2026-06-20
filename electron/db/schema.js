// File: ogs-client/depot/electron/db/schema.js
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

// Products Table
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  barcode: text('barcode').unique(),
  price: real('price').notNull(),
  stock: integer('stock').notNull().default(0),
  category: text('category'),
  // SQLite stores dates as integers (unix timestamp) or text
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  // Sync fields
  syncStatus: text('sync_status').default('pending'), // pending, synced, error
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
}, (table) => ({
  updatedAtIdx: index('products_updated_at_idx').on(table.updatedAt),
  barcodeIdx: index('products_barcode_idx').on(table.barcode),
  syncStatusIdx: index('products_sync_status_idx').on(table.syncStatus),
}));

// Sales Table
export const sales = sqliteTable('sales', {
  id: text('id').primaryKey(),
  totalAmount: real('total_amount').notNull(),
  paymentMethod: text('payment_method').notNull(), 
  status: text('status').default('Completed'), // Added status
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  // Sync fields
  syncStatus: text('sync_status').default('pending'),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
}, (table) => ({
  createdAtIdx: index('sales_created_at_idx').on(table.createdAt),
  syncStatusIdx: index('sales_sync_status_idx').on(table.syncStatus),
}));

// Sale Items Table
export const saleItems = sqliteTable('sale_items', {
  id: text('id').primaryKey(),
  saleId: text('sale_id').notNull().references(() => sales.id),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  priceAtSale: real('price_at_sale').notNull(),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
}, (table) => ({
  saleIdIdx: index('sale_items_sale_id_idx').on(table.saleId),
  productIdIdx: index('sale_items_product_id_idx').on(table.productId),
}));

// Stock History Table
export const stockHistory = sqliteTable('stock_history', {
  id: text('id').primaryKey(),
  productId: text('product_id'),
  productName: text('product_name'),
  previousStock: integer('previous_stock'),
  currentStock: integer('current_stock'),
  changeAmount: integer('change_amount'),
  reason: text('reason'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  // Sync fields
  syncStatus: text('sync_status').default('pending'),
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
});

// Sync State Table (Key-Value Key Store for checkpoints)
export const syncState = sqliteTable('sync_state', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
