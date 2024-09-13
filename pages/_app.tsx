// pages/_app.tsx
import { AppProps } from 'next/app';
import Layout from '@/components/layout';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DrawerProvider } from '@/context/DrawerContext';
import { Kanit } from 'next/font/google';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';

const kanit = Kanit({
  weight: ['300', '400', '700'],
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-kanit',
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className={`${kanit.variable} font-sans`}>
      <AuthProvider>
        <DrawerProvider>
          <Layout>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <AuthWrapper>
                <Component {...pageProps} />
              </AuthWrapper>
            </LocalizationProvider>
          </Layout>
        </DrawerProvider>
      </AuthProvider>
    </div>
  );
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, loading, checkAuth } = useAuth();

  useEffect(() => {
    if (
      !loading &&
      !isLoggedIn &&
      router.pathname !== '/' &&
      router.pathname !== '/login'
    ) {
      router.replace('/login');
    }
  }, [isLoggedIn, loading, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}

export default MyApp;
