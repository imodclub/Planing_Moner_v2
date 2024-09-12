import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Container,
} from '@mui/material';
import { verifyAuth } from '@/lib/auth';
import { useRouter } from 'next/router';

interface ExpenseData {
  label: string;
  amount: number;
  comment: string;
}

const TotalExpense: React.FC = () => {
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await verifyAuth();

        const expenseResponse = await fetch(
          `/api/reports/${user.userId}?report=totalExpense`
        );
        if (!expenseResponse.ok) {
          throw new Error('Failed to fetch total expense data');
        }

        const { data } = await expenseResponse.json();
        setExpenseData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  if (loading) {
    return <div>กำลังโหลดข้อมูล...</div>;
  }

  return (
    <Container maxWidth={false}>
      <Typography variant="h6" gutterBottom>
        ค่าใช้จ่ายทั้งหมด
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: '100%' }} aria-label="total expense table">
          <TableHead>
            <TableRow>
              <TableCell>รายการ</TableCell>
              <TableCell align="right">จำนวนเงิน</TableCell>
              <TableCell>รายละเอียด</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenseData.map((item, index) => (
              <TableRow
                key={index}
                sx={{
                  '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                }}
              >
                <TableCell component="th" scope="row">
                  {item.label}
                </TableCell>
                <TableCell align="right">
                  {formatNumber(Math.round(item.amount))}
                </TableCell>
                <TableCell>{item.comment}</TableCell>
              </TableRow>
            ))}
            <TableRow
              sx={{
                backgroundColor: 'primary.light',
                fontWeight: 'bold',
              }}
            >
              <TableCell component="th" scope="row">
                รวมค่าใช้จ่ายทั้งหมด
              </TableCell>
              <TableCell align="right">
                {formatNumber(Math.round(totalExpense))}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TotalExpense;
