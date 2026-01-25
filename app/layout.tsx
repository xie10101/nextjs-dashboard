import "./ui/global.css"
// 在顶层组件中导入样式使得原子类可以使用 
import {inter}  from "@/app/ui/fonts"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body  className={`${inter.className} antialiased`}>{children}</body>

    </html>
  );
}
