import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { db } from './app/database/orm_database';
import { users } from './app/database/users';
import { eq } from 'drizzle-orm';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcryptjs';

//  从数据库查询用户信息
async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await db.select().from(users).where(eq(users.email, email));
    return user[0] as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
 providers: [
        Credentials({

          // 验证程序 
      async authorize(credentials) {
         // 1. 使用 Zod 验证用户输入的格式是否正确（必须是合法的 email，密码至少 6 位
        const parsedCredentials = z  
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
        // 2. 如果格式验证通过  
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
        // 验证加密密码
           const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user; 
          // 返回数据会存在session中吗 ？ 会存在，但是不会被直接暴露在客户端
        }
 //当 signIn 登录成功后，它会自动检测 URL 上的 callbackUrl 参数，并跳回该地址。这是最常见的跳转逻辑。
        console.log('Invalid credentials');
        return null;
      }, 
    }),
 ],
});