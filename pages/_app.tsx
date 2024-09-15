// pages/_app.tsx
import { AppProps } from 'next/app';
import Layout from '@/components/layout';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DrawerProvider } from '@/context/DrawerContext';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@/styles/theme';



function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, loading, checkAuth } = useAuth();

  const redirectToLogin = useCallback(() => {
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
    redirectToLogin();
  }, [redirectToLogin]);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ทำงานเพียงครั้งเดียวเมื่อคอมโพเนนต์ถูกโหลด

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}


export default MyApp;
