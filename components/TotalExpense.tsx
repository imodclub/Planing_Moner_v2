import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '@/context/AuthContext'; // เพิ่มการ import useAuth hook

const TotalExpense: React.FC = () => {
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const { userId } = useAuth(); // เพิ่มการใช้ useAuth hook เพื่อรับ userId

  useEffect(() => {
    const fetchTotalExpense = async () => {
      if (!userId) return; // ตรวจสอบว่ามี userId หรือไม่ก่อนเรียก API

      try {
        // เพิ่ม userId ในการเรียก API
        const response = await fetch(`/api/total-expense?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch total expense');
        }
        const data = await response.json();
        setTotalExpense(data.totalExpense);
      } catch (error) {
        console.error('Error fetching total expense:', error);
      }
    };

    fetchTotalExpense();
  }, [userId]); // เพิ่ม userId เป็น dependency ของ useEffect

  return (
    <Box>
      <Typography variant="h6" component="h2" gutterBottom>
        รายจ่ายทั้งหมด
      </Typography>
      <Typography variant="h4" component="p">
        {totalExpense.toLocaleString('th-TH', {
          style: 'currency',
          currency: 'THB',
        })}
      </Typography>
    </Box>
  );
};

export default TotalExpense;
