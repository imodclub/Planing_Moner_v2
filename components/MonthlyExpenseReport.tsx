import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, Paper, Grid2 } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

interface ExpenseItem {
  label: string;
  amount: number;
}

interface MonthlyExpense {
  month: string;
  items: ExpenseItem[];
  total: number;
}

const MonthlyExpenseReport: React.FC = () => {
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpense[]>([]);
  const { user } = useAuth();
  const userId = user?.userId;

  useEffect(() => {
    const fetchMonthlyExpenses = async () => {
      if (!userId) return;
      try {
        const response = await fetch(`/api/monthly-expense/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setMonthlyExpenses(data);
        } else {
          console.error('Failed to fetch monthly expenses');
        }
      } catch (error) {
        console.error('Error fetching monthly expenses:', error);
      }
    };

    fetchMonthlyExpenses();
  }, [userId]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('th-TH');
  };

  const totalExpense = monthlyExpenses.reduce((sum, expense) => sum + expense.total, 0);

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          รายงานค่าใช้จ่ายประจำเดือน
        </Typography>
      </Box>
      <Grid2 container spacing={2}>
  {monthlyExpenses.map((expense) => (
    <Grid2 size={12} key={expense.month}>
      <Paper elevation={2} sx={{ p: 2 }}>
        <Typography variant="h6" component="h2">
          {expense.month}
        </Typography>
        {expense.items.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              my: 1
            }}
          >
            <Typography variant="body1">{item.label}</Typography>
            <Typography variant="body1">{formatCurrency(item.amount)} บาท</Typography>
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
          <Typography variant="body1" fontWeight="bold">ค่าใช้จ่ายรวม</Typography>
          <Typography variant="body1" fontWeight="bold">{formatCurrency(expense.total)} บาท</Typography>
        </Box>
      </Paper>
    </Grid2>
  ))}
</Grid2>
      <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1 }}>
        <Typography variant="h6" component="p">
          ค่าใช้จ่ายรวมทั้งปี: {formatCurrency(totalExpense)} บาท
        </Typography>
      </Box>
    </Container>
  );
};

export default MonthlyExpenseReport;