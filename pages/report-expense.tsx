import React from 'react';
import MonthlyExpenseSummary from '@/components/MonthlyExpenseSummary';
import { Container, Box, Typography } from '@mui/material';
import MonthlyExpenseReport from '@/components/MonthlyExpenseReport';

const MonthlyExpenseSummaryPage: React.FC = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          สรุปรายรับรายเดือน
        </Typography>
      </Box>
      <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2, boxShadow: 1 }}>
        <MonthlyExpenseSummary />
      </Box>
      <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2, boxShadow: 1 }}>
      <MonthlyExpenseReport />
      </Box>
    </Container>
  );
};

export default MonthlyExpenseSummaryPage;