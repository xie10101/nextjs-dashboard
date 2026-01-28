import { pgTable, serial, varchar, integer, uuid } from 'drizzle-orm/pg-core';

// serial (自增整数) 改为 uuid (通用唯一识别码)。  
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  customer_id: varchar('customer_id', { length: 255 }).notNull(),
  amount:  integer('amount').notNull(),
  status: varchar('status', { length: 255 }).notNull(),
  date: varchar('date', { length: 255 }).notNull(),
});

// 类型导出
export type Invoice = typeof invoices.$inferSelect; 
export type NewInvoice = typeof invoices.$inferInsert;
