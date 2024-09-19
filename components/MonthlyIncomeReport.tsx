import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Paper, Grid2 } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

interface IncomeItem {
  label: string;
  amount: number;
}

interface MonthlyIncome {
  month: string;
  items: IncomeItem[];
  total: number;
}

const MonthlyIncomeReport: React.FC = () => {
  const [monthlyIncomes, setMonthlyIncomes] = useState<MonthlyIncome[]>([]);
  const { user } = useAuth();
  const userId = user?.userId;

  useEffect(() => {
    const fetchMonthlyIncomes = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`/api/monthly-income/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setMonthlyIncomes(data);
        } else {
          console.error('Failed to fetch monthly incomes');
        }
      } catch (error) {
        console.error('Error fetching monthly incomes:', error);
      }
    };

    fetchMonthlyIncomes();
  }, [userId]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('th-TH');
  };

  const totalIncome = monthlyIncomes.reduce((sum, income) => sum + income.total, 0);

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          รายงานรายรับประจำเดือน
        </Typography>
      </Box>
      <Grid2 container spacing={2}>
        {monthlyIncomes.map((income) => (
          <Grid2 size={12} key={income.month}>
            <Paper elevation={2} sx={{ p: 2 }}>
              <Typography variant="h6" component="h2">
                {income.month}
              </Typography>
              {income.items.map((item, index) => (
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
                <Typography variant="body1">
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
                รายรับรวม
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatCurrency(income.total)} บาท
              </Typography>
              </Box>
            </Paper>
          </Grid2>
        ))}
      </Grid2>
      <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1 }}>
        <Typography variant="h6" component="p">
          ยอดรวมทั้งปี: {formatCurrency(totalIncome)} บาท
        </Typography>
      </Box>
    </Container>
  );
};

export default MonthlyIncomeReport;