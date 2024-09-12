// pages/dashboard.tsx
import { GetServerSideProps } from 'next';
import { Container, Box, Typography } from '@mui/material';
import AnnualFinancialSummaryChart from '@/components/AnnualFinancialSummaryChart';
import TotalIncome from '@/components/TotalIncome';
import TotalExpense from '@/components/TotalExpense';
import { withAuth } from '@/components/withAuth';



function Dashboard() {
  
  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
        <Box>
          <Typography variant="h6" component="h1" gutterBottom>
            รายงานรายรับ-รายจ่าย และเงินออมของคุณ
          </Typography>
        </Box>
        <Box>
          <AnnualFinancialSummaryChart />
        </Box>
        <Box sx={{ mt: 4 }}>
        </Box>
        <Box sx={{ mt: 4 }}>
          <TotalIncome />
        </Box>
        <Box sx={{ mt: 4 }}>
          <TotalExpense />
        </Box>
      </Box>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const sessionId = req.cookies.auth_token;

  if (!sessionId) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {}, // ส่ง props ไปยังคอมโพเนนต์ Dashboard
  };
};

export default withAuth(Dashboard);
