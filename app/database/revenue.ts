import { integer, pgTable, varchar } from 'drizzle-orm/pg-core'; 

export const revenue = pgTable('revenue', {
 month : varchar('month').notNull(),
 revenue : integer('revenue').notNull(),
});

export type Revenue = typeof revenue.$inferSelect;