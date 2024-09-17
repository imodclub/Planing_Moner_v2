import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid2, Box } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { styled } from '@mui/material/styles';


interface MonthlyIncome {
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

const IncomeAmount = styled(Typography)(({}) => ({
  fontWeight: 400,
}));

const TotalAmount = styled(Typography)(({}) => ({
  fontWeight: 500,
}));

const MonthlyIncomeSummary: React.FC = () => {
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

  // คำนวณผลรวมรายรับทั้งหมด
  const totalIncome = monthlyIncomes.reduce(
    (acc, income) => acc + income.total,
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
          สรุปรายรับรายเดือน
        </Typography>
        <Grid2 container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
          {monthNames.map((month) => {
            const income = monthlyIncomes.find((i) => i.month === month) || {
              total: 0,
            };
            return (
              <Grid2 size={6} key={month}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <MonthLabel variant="body1">{month}:</MonthLabel>
                  <IncomeAmount variant="body1">
                    {income.total.toLocaleString('th-TH', {
                      style: 'currency',
                      currency: 'THB',
                    })}
                  </IncomeAmount>
                </Box>
              </Grid2>
            );
          })}
        </Grid2>
        <Box sx={{ mt: 2, borderTop: '1px solid #ccc', pt: 2 }}>
          <TotalAmount variant="h6">
            ผลรวมรายรับทั้งหมด:{' '}
            {totalIncome.toLocaleString('th-TH', {
              style: 'currency',
              currency: 'THB',
            })}
          </TotalAmount>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default MonthlyIncomeSummary;
