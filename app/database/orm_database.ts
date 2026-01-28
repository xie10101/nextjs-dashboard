import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// 环境变量：DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/dbname
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql);

// 导出类型供组件使用
export type DbClient = typeof db;