// pages/_app.tsx
import { AppProps } from 'next/app';
import '../styles/globals.css'; // นำเข้าไฟล์ CSS
import Layout from '@/components/layout';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DrawerProvider } from '@/context/DrawerContext';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <DrawerProvider>
      <Layout>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Component {...pageProps} />
    </LocalizationProvider>
    </Layout>
    </DrawerProvider>

  );
}

export default MyApp;