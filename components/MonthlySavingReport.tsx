import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Paper, Grid2 } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

interface SavingItem {
  label: string;
  amount: number;
}

interface MonthlySaving {
  month: string;
  items: SavingItem[];
  total: number;
}

const MonthlySavingReport: React.FC = () => {
  const [monthlySavings, setMonthlySavings] = useState<MonthlySaving[]>([]);
  const { user } = useAuth();
  const userId = user?.userId;

  useEffect(() => {
    const fetchMonthlySavings = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`/api/monthly-saving/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setMonthlySavings(data);
        } else {
          console.error('Failed to fetch monthly savings');
        }
      } catch (error) {
        console.error('Error fetching monthly savings:', error);
      }
    };

    fetchMonthlySavings();
  }, [userId]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('th-TH');
  };

  const totalSaving = monthlySavings.reduce((sum, saving) => sum + saving.total, 0);

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          รายงานเงินออมประจำเดือน
        </Typography>
      </Box>
      <Grid2 container spacing={2}>
        {monthlySavings.map((saving) => (
          <Grid2 size={12} key={saving.month}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" component="h2">
                {saving.month}
              </Typography>
              {saving.items.map((item, index) => (
                <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  my: 1
                }}
              >
                <Typography  variant="body1">
                  {item.label} บาท
                </Typography>
                <Typography  variant="body1">
                  {formatCurrency(item.amount)} บาท
                </Typography>
                </Box>
              ))}
              <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
            pt: 1,
            borderTop: '1px solid #e0e0e0'
          }}
        >
              <Typography variant="body1" fontWeight="bold">
                เงินออมรวม บาท
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatCurrency(saving.total)} บาท
              </Typography>
              </Box>
            </Paper>
          </Grid2>
        ))}
      </Grid2>
      <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1 }}>
        <Typography variant="h6" component="p">
          เงินออมรวมทั้งปี: {formatCurrency(totalSaving)} บาท
        </Typography>
      </Box>
    </Container>
  );
};

export default MonthlySavingReport;