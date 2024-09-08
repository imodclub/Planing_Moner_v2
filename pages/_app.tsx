// pages/_app.tsx
import { AppProps } from 'next/app';
import '../styles/globals.css'; // นำเข้าไฟล์ CSS
import MyAppBar from '../components/AppBar'; // นำเข้าคอมโพเนนต์ MyAppBar
import Layout from '@/components/layout';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MyAppBar /> {/* วาง MyAppBar ไว้ที่นี่ */}
      <Component {...pageProps} />
    </LocalizationProvider>
  );
}

export default MyApp;