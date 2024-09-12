import React, { useEffect, useState, useRef } from 'react';
import Cookies from 'js-cookie';
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

interface ExpenseData {
  label: string;
  amount: number;
  comment: string;
}

const TotalExpense: React.FC = () => {
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const isFetched = useRef(false);

  useEffect(() => {
    const sessionIdFromCookie = Cookies.get('sessionID');
    if (sessionIdFromCookie) {
      setSessionId(sessionIdFromCookie);
    } else {
      console.error('No sessionId found in cookie');
    }
  }, []);

  useEffect(() => {
    if (sessionId && !isFetched.current) {
      const fetchData = async () => {
        try {
          const userIdResponse = await fetch(`/api/session/${sessionId}`);
          if (!userIdResponse.ok) {
            console.error('Failed to fetch userID');
            return;
          }

          const { userId } = await userIdResponse.json();

          const userNameResponse = await fetch(`/api/users/${userId}`);
          if (!userNameResponse.ok) {
            console.error('Failed to fetch userName');
            return;
          }


          const expenseResponse = await fetch(
            `/api/reports/${userId}?report=totalExpense`
          );
          if (!expenseResponse.ok) {
            console.error('Failed to fetch total expense data');
            return;
          }

          const { data } = await expenseResponse.json();
          setExpenseData(data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        isFetched.current = true;
      };

      fetchData();
    }
  }, [sessionId]);

  const totalExpense = expenseData.reduce((sum, item) => sum + item.amount, 0);

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  return (
    <Container maxWidth={false}>
      <Typography variant="h6" gutterBottom>
        ค่าใช้จ่ายทั้งหมด
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: '100%' }} aria-label="total expense table">
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Comment</TableCell>
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
                <TableCell align="right">{formatNumber(Math.round(item.amount))}</TableCell>
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
              <TableCell align="right">{formatNumber(Math.round(totalExpense))}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TotalExpense;