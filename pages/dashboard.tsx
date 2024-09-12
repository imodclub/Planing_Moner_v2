// pages/dashboard.tsx
import { GetServerSideProps } from 'next';
import { Container, Box, Typography } from '@mui/material';
import AnnualFinancialSummaryChart from '@/components/AnnualFinancialSummaryChart';
import TotalIncome from '@/components/TotalIncome';
import TotalExpense from '@/components/TotalExpense';

export default function Dashboard() {
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
        <Box sx={{mt:4}}>
          <TotalIncome />
        </Box>
        <Box sx={{mt:4}}>
          <TotalExpense />
        </Box>
      </Box>
    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const sessionId = req.cookies.sessionID;

  if (!sessionId) {
    return {
      redirect: {
        destination: '/sign-in',
        permanent: false,
      },
    };
  }

  return {
    props: {}, // ส่ง props ไปยังคอมโพเนนต์ Dashboard
  };
};
