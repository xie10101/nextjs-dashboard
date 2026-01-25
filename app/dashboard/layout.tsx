import { lusitana } from '@/app/ui/fonts';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full">   
       <div className="flex grow flex-col">
        {children}
      </div>
    </div>
  );
}