import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
    // 指定自定义登录、退出登录和错误页面的路由
    // 用户将被重定向到我们的自定义登录页面，而不是 NextAuth.js 默认页面。
  },
    //   保护路由逻辑 
    callbacks: {
        // 验证通过 Next.js 中间件访问页面的请求是否被授权
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
