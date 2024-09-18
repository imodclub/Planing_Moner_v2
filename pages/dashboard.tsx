// pages/dashboard.tsx
import { GetServerSideProps } from 'next';
import { Container, Box, Typography } from '@mui/material';

import { withAuth } from '@/components/withAuth';
import { verifyAuth } from '@/lib/auth'
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import AnnualFinancialSummaryChart from '@/components/AnnualFinancialSummaryChart';
import MonthlyIncomeSummary from '@/components/MonthlyIncomeSummary';
import MonthlyExpenseSummary from '@/components/MonthlyExpenseSummary';
import MonthlySavingSummary from '@/components/MonthlySavingSummary';
import ShortFinancialSummaryReport from '@/components/ShortFinancialSummaryReport';



function Dashboard() {
  const { user, isLoggedIn } = useAuth(); // ใช้ useAuth hook
  const router = useRouter(); // ใช้ useRouter

  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.push('/login');
    }
  }, [isLoggedIn, user, router]);

  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            รายงานรายรับ-รายจ่าย และเงินออมของคุณ
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6" component="h1" gutterBottom>
            <ShortFinancialSummaryReport />
          </Typography>
        </Box>
        <Box>
          <Typography variant="h6" component="h1" gutterBottom>
            <AnnualFinancialSummaryChart />
          </Typography>
        </Box>
        <Box sx={{ mt: 4 }}></Box>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" component="h1" gutterBottom>
            <MonthlyIncomeSummary />
          </Typography>
        </Box>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" component="h1" gutterBottom>
            <MonthlyExpenseSummary />
          </Typography>
        </Box>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" component="h1" gutterBottom>
            <MonthlySavingSummary />
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    await verifyAuth(context.req);
    return { props: {} };
  } catch (error) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};

export default withAuth(Dashboard);
