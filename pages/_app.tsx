// pages/_app.tsx
import { AppProps } from 'next/app';
import Layout from '@/components/layout';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DrawerProvider } from '@/context/DrawerContext';
import { Kanit } from 'next/font/google';

const kanit = Kanit({
  weight: ['300', '400', '700'], // เพิ่มน้ำหนักฟอนต์ตามที่ต้องการใช้
  subsets: ['thai', 'latin'], // เพิ่ม 'latin' เพื่อรองรับตัวอักษรภาษาอังกฤษ
  display: 'swap',
  variable: '--font-kanit', // กำหนดตัวแปร CSS สำหรับใช้ในสไตล์
});

function MyApp({ Component, pageProps }: AppProps) {
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
