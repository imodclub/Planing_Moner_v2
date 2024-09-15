import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '@/context/AuthContext'; // เพิ่มการ import useAuth hook

const TotalIncome: React.FC = () => {
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const { userId } = useAuth(); // เพิ่มการใช้ useAuth hook เพื่อรับ userId

  useEffect(() => {
    const fetchTotalIncome = async () => {
      if (!userId) return; // ตรวจสอบว่ามี userId หรือไม่ก่อนเรียก API

      try {
        // เพิ่ม userId ในการเรียก API
        const response = await fetch(`/api/total-income?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch total income');
        }
        const data = await response.json();
        setTotalIncome(data.totalIncome);
      } catch (error) {
        console.error('Error fetching total income:', error);
      }
    };

    fetchTotalIncome();
  }, [userId]); // เพิ่ม userId เป็น dependency ของ useEffect

  return (
    <Box>
      <Typography variant="h6" component="h2" gutterBottom>
        รายรับทั้งหมด
      </Typography>
      <Typography variant="h4" component="p">
        {totalIncome.toLocaleString('th-TH', {
          style: 'currency',
          currency: 'THB',
        })}
      </Typography>
    </Box>
  );
};

export default TotalIncome;
