import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

//  
export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  image_url: varchar('image_url', { length: 255 }),
});

// 类型导出
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
