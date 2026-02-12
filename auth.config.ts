import type { NextAuthConfig } from 'next-auth';
//被设计为不依赖 Node.js 运行时环境（如 bcrypt 或数据库），以便可以在 Edge Runtime（中间件）中运行
 
export const authConfig = {
  pages: {
    signIn: '/login', 
    //指定自定义登录、退出登录和错误页面的路由， 对应于 app/login/page.tsx (会自动生产一个默认登录页面)
  },
session: {
    strategy: "jwt", // 使用 JWT
  },

    //   保护路由逻辑 
    callbacks: {
        // 验证通过 Next.js 中间件访问页面的请求是否被授权
    async jwt({ token, user }) {
      if (user) {
        // 把自定义字段加到 token 里
        token.id = user.id;
      }
      return token;
    },

    // 2️⃣ Session 回调：把 token 映射到 session 给前端使用
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  
        //这个函数会在 Next.js Middleware（中间件）中被调用 
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl)); // 可以扩展操作 
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
    // 3. Providers：这里留空
  // 真正的 providers（如 Credentials）在 auth.ts 中配置。
  // 这样做是因为 auth.ts 可能包含非 Edge 兼容的库（如 bcrypt），
  // 而 auth.config.ts 需要保持轻量以在中间件中运行。
} satisfies NextAuthConfig;

//  路由拦截- 路由保护规则配置 