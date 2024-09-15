import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid2, Box } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { styled } from '@mui/material/styles';

interface MonthlyExpense {
  month: string;
  total: number;
}

const monthNames = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

const StyledCard = styled(Card)(({}) => ({
  '& .MuiTypography-root': {
    fontFamily: 'Kanit, sans-serif',
  },
}));

const MonthLabel = styled(Typography)(({}) => ({
  fontWeight: 400,
}));

const ExpenseAmount = styled(Typography)(({}) => ({
  fontWeight: 400,
}));

const TotalAmount = styled(Typography)(({}) => ({
  fontWeight: 500,
}));

const MonthlyExpenseSummary: React.FC = () => {
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

  // คำนวณผลรวมรายจ่ายทั้งหมด
  const totalExpense = monthlyExpenses.reduce(
    (acc, expense) => acc + expense.total,
    0
  );

  return (
    <StyledCard>
      <CardContent>
        <Typography
          variant="h5"
          component="div"
          gutterBottom
          sx={{ fontWeight: 400 }}
        >
          สรุปรายจ่ายรายเดือน
        </Typography>
        <Grid2 container spacing={2}>
          {monthNames.map((month) => {
            const expense = monthlyExpenses.find((e) => e.month === month) || {
              total: 0,
            };
            return (
              <Grid2 size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={month}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <MonthLabel variant="body1">{month}:</MonthLabel>
                  <ExpenseAmount variant="body1">
                    {expense.total.toLocaleString('th-TH', {
                      style: 'currency',
                      currency: 'THB',
                    })}
                  </ExpenseAmount>
                </Box>
              </Grid2>
            );
          })}
        </Grid2>
        <Box sx={{ mt: 2, borderTop: '1px solid #ccc', pt: 2 }}>
          <TotalAmount variant="h6">
            ผลรวมรายจ่ายทั้งหมด:{' '}
            {totalExpense.toLocaleString('th-TH', {
              style: 'currency',
              currency: 'THB',
            })}
          </TotalAmount>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default MonthlyExpenseSummary;
