import React from 'react';
import MonthlySavingSummary from '@/components/MonthlySavingSummary';
import { Container, Box, Typography } from '@mui/material';
import MonthlySavingReport from '@/components/MonthlySavingReport';

const MonthlySavingSummaryPage: React.FC = () => {
  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          สรุปรายเงินออม
        </Typography>
      </Box>
      <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2, boxShadow: 1 }}>
        <MonthlySavingSummary />
      </Box>
      <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2, boxShadow: 1 }}>
      <MonthlySavingReport />
      </Box>
    </Container>
  );
};

export default MonthlySavingSummaryPage;