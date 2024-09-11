// pages/dashboard.tsx
import { GetServerSideProps } from 'next';
import { Container, Box, Typography } from '@mui/material';
import AnnualFinancialSummaryChart from '@/components/AnnualFinancialSummaryChart';

export default function Dashboard() {
  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
        <Typography variant="h6" component="h1" gutterBottom>
          รายงานรายรับ-รายจ่าย และเงินออมของคุณ
        </Typography>
        <AnnualFinancialSummaryChart />
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
