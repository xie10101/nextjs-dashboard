import NextAuth from 'next-auth';
import { authConfig } from './auth.config'; // 导入 authConfig 模块
 
export default NextAuth(authConfig).auth;
 
export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
//  指定auth 属性应该在特定路径上运行。
};

//中间件验证身份之前甚至不会开始渲染，从而增强了应用程序的安全性和性能。