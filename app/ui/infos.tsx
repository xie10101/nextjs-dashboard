import { auth } from '@/auth';

export default async function Info() {
  const session = await auth(); // authjs.session-token Cookie，但 NextAuth 会在服务端自动解密它。你不需要手动解析 Cookie。
   
  if (!session?.user) return null;
  console.log(session.user);
  return (
    <div>
      <p>用户ID: </p>
      <p>欢迎, {session.user.name}</p>
      <p>邮箱: {session.user.email}</p>
      {/* 注意：默认情况下 session.user 可能不包含 id */}
    </div>
  );
}