import DashboardSkeleton  from "@/app/ui/skeletons"

// loading.tsx - 流失传输 整个页面 
// 加载骨架 

/**
 * 
 * 流式传输是一种数据传输技术，允许您将路由分解为较小的 “chunks（块）”，并在它们准备就绪时逐步从服务器流式传输到客户端。
 * 直白说 -- 分布加载 - 先给甜点 后上主材， 或者分布上菜
 * 在 Next.js 中，有两种实现流式传输的方式：
    在页面级别，使用 loading.tsx 文件。
    对于特定组件，使用 <Suspense>。
 */
export default function Loading() {
  return <DashboardSkeleton />;
}