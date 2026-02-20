import { Inter , Lusitana } from 'next/font/google';
export  const inter = Inter({ subsets: ['latin'] });

export default inter; 
//  next/font/google -- 谷歌字体 --粗细存在调整
//  subsets: ['latin'] -- 加载子集 


export const lusitana = Lusitana({ 
     weight: ['400', '700'],
     subsets: ['latin'],
});
