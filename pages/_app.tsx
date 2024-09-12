// pages/_app.tsx
import { AppProps } from 'next/app';
import Layout from '@/components/layout';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DrawerProvider } from '@/context/DrawerContext';
import { Kanit } from 'next/font/google';
import { verifyAuth } from '@/lib/auth';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const kanit = Kanit({
  weight: ['300', '400', '700'], // เพิ่มน้ำหนักฟอนต์ตามที่ต้องการใช้
  subsets: ['thai', 'latin'], // เพิ่ม 'latin' เพื่อรองรับตัวอักษรภาษาอังกฤษ
  display: 'swap',
  variable: '--font-kanit', // กำหนดตัวแปร CSS สำหรับใช้ในสไตล์
});

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
   useEffect(() => {
     if (router.pathname !== '/' && router.pathname !== '/login') {
       try {
         verifyAuth();
       } catch (error) {
         router.replace('/login');
       }
     }
   }, [router]);
  return (
    <div className={`${kanit.variable} font-sans`}>
      <DrawerProvider>
        <Layout>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Component {...pageProps} />
          </LocalizationProvider>
        </Layout>
      </DrawerProvider>
    </div>
  );
}

export default MyApp;
