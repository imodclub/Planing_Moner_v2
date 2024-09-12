import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { verifyAuth } from '@/lib/auth';

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AuthComponent(props: P) {
    const router = useRouter();
    const [verified, setVerified] = useState(false);

    useEffect(() => {
      async function checkAuth() {
        try {
          await verifyAuth();
          setVerified(true);
        } catch (error) {
          console.error('Authentication error:', error);
          router.replace('/login');
        }
      }
      checkAuth();
    }, [router]);

    if (!verified) {
      return null; // หรือแสดง loading indicator
    }

    return <WrappedComponent {...props} />;
  };
}
