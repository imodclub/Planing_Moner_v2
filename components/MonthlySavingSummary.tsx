import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid2, Box } from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import { styled } from '@mui/material/styles';

interface MonthlySaving {
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

const SavingAmount = styled(Typography)(({}) => ({
  fontWeight: 400,
}));

const TotalAmount = styled(Typography)(({}) => ({
  fontWeight: 500,
}));

const MonthlySavingSummary: React.FC = () => {
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

  // คำนวณผลรวมเงินออมทั้งหมด
  const totalSaving = monthlySavings.reduce(
    (acc, saving) => acc + saving.total,
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
          สรุปเงินออมรายเดือน
        </Typography>
        <Grid2 container spacing={2}>
          {monthNames.map((month) => {
            const saving = monthlySavings.find((s) => s.month === month) || {
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
                  <SavingAmount variant="body1">
                    {saving.total.toLocaleString('th-TH', {
                      style: 'currency',
                      currency: 'THB',
                    })}
                  </SavingAmount>
                </Box>
              </Grid2>
            );
          })}
        </Grid2>
        <Box sx={{ mt: 2, borderTop: '1px solid #ccc', pt: 2 }}>
          <TotalAmount variant="h6">
            ผลรวมเงินออมทั้งหมด:{' '}
            {totalSaving.toLocaleString('th-TH', {
              style: 'currency',
              currency: 'THB',
            })}
          </TotalAmount>
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default MonthlySavingSummary;
