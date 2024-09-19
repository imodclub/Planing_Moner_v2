import React from 'react';
import MonthlyIncomeSummary from '@/components/MonthlyIncomeSummary';
import { Container, Box, Typography } from '@mui/material';
import MonthlyIncomeReport from '@/components/MonthlyIncomeReport';

const MonthlyIncomeSummaryPage: React.FC = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          สรุปรายรับรายเดือน
        </Typography>
      </Box>
      <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2, boxShadow: 1 }}>
        <MonthlyIncomeSummary />
      </Box>
      <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2, boxShadow: 1 }}>
      <MonthlyIncomeReport />
      </Box>
    </Container>
  );
};

export default MonthlyIncomeSummaryPage;