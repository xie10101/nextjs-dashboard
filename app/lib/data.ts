//   server层 - 数据获取层- / controller 
import { formatCurrency } from './utils';
import { db } from '../database/orm_database';
import { customers, invoices, revenue } from '../database';
import { desc, eq, count, sql, ilike, or, asc } from 'drizzle-orm';
//  现在进行改写 - 结合 orm 
import { unstable_noStore as noStore } from 'next/cache';
import {InvoiceForm} from './definitions';
/**
 *   unstable_noStore（通常别名为 noStore）
 *   是 Next.js 提供的显式退出缓存的 API，用于强制组件或函数进行动态渲染（Dynamic Rendering），
 *   确保每次请求都实时获取最新数据。
 */
export async function fetchRevenue() {
  noStore(); 
  try {
    //  模拟慢速获取 
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    // console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000)); // 存在渲染延迟  -link 点击点不动的现象

    const data = await db.select().from(revenue).limit(10);

    // console.log('Data fetch completed after 3 seconds.');

    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}
export async function fetchLatestInvoices() {
    noStore();
  try {
    const data = await db
      .select({
        amount: invoices.amount,
        name: customers.name,
        image_url: customers.image_url,
        email: customers.email,
        id: invoices.id,
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customer_id, customers.id))
      .orderBy(desc(invoices.date))
      .limit(5);

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
   noStore(); 
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = db.select({ count: count() }).from(invoices);
    const customerCountPromise = db.select({ count: count() }).from(customers);
    const invoiceStatusPromise = db
      .select({
        paid: sql<number>`SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.amount} ELSE 0 END)`,
        pending: sql<number>`SUM(CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.amount} ELSE 0 END)`,
      })
      .from(invoices);

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0][0].count ?? '0');
    const numberOfCustomers = Number(data[1][0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2][0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2][0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    const data = await db
      .select({
        id: invoices.id,
        amount: invoices.amount,
        date: invoices.date,
        status: invoices.status,
        name: customers.name,
        email: customers.email,
        image_url: customers.image_url,
      })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customer_id, customers.id))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
          ilike(sql`${invoices.amount}::text`, `%${query}%`),
          ilike(sql`${invoices.date}::text`, `%${query}%`),
          ilike(invoices.status, `%${query}%`),
        ),
      )
      .orderBy(desc(invoices.date))
      .limit(ITEMS_PER_PAGE)
      .offset(offset);
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const data = await db
      .select({ count: count() })
      .from(invoices)
      .innerJoin(customers, eq(invoices.customer_id, customers.id))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
          ilike(sql`${invoices.amount}::text`, `%${query}%`),
          ilike(sql`${invoices.date}::text`, `%${query}%`),
          ilike(invoices.status, `%${query}%`),
        ),
      );

    const totalPages = Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await db
      .select({
        id: invoices.id,
        customer_id: invoices.customer_id,
        amount: invoices.amount,
        status: invoices.status,
      })
      .from(invoices)
      .where(eq(invoices.id, id));

    const invoice = data.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0] as InvoiceForm ;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const data = await db
      .select({
        id: customers.id,
        name: customers.name,
      })
      .from(customers)
      .orderBy(asc(customers.name));

    return data;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        image_url: customers.image_url,
        total_invoices: count(invoices.id),
        total_pending: sql<number>`SUM(CASE WHEN ${invoices.status} = 'pending' THEN ${invoices.amount} ELSE 0 END)`,
        total_paid: sql<number>`SUM(CASE WHEN ${invoices.status} = 'paid' THEN ${invoices.amount} ELSE 0 END)`,
      })
      .from(customers)
      .leftJoin(invoices, eq(customers.id, invoices.customer_id))
      .where(
        or(
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`),
        ),
      )
      .groupBy(
        customers.id,
        customers.name,
        customers.email,
        customers.image_url,
      )
      .orderBy(asc(customers.name));

    const customersData = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customersData;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}
