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

interface IncomeData {
  label: string;
  amount: number;
  comment: string;
}

const TotalIncome: React.FC = () => {
  const [incomeData, setIncomeData] = useState<IncomeData[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const isFetched = useRef(false);

  useEffect(() => {
    const sessionIdFromCookie = Cookies.get('sessionID');
    if (sessionIdFromCookie) {
      setSessionId(sessionIdFromCookie);
      console.log('Fetched sessionID from cookie:', sessionIdFromCookie);
    } else {
      console.error('No sessionId found in cookie');
    }
  }, []);

  useEffect(() => {
    if (sessionId && !isFetched.current) {
      const fetchData = async () => {
        try {
          // เรียก API เพื่อค้นหา userID จาก sessionID
          const userIdResponse = await fetch(`/api/session/${sessionId}`);
          if (!userIdResponse.ok) {
            console.error('Failed to fetch userID');
            return;
          }

          const { userId } = await userIdResponse.json();
          setUserId(userId);

          // เรียก API เพื่อดึงชื่อผู้ใช้
          const userNameResponse = await fetch(`/api/users/${userId}`);
          if (!userNameResponse.ok) {
            console.error('Failed to fetch userName');
            return;
          }

          const { name } = await userNameResponse.json();
          setUserName(name);

          // เรียก API เพื่อดึงข้อมูลรายได้
          const incomeResponse = await fetch(
            `/api/reports/${userId}?report=totalIncome`
          );
          if (!incomeResponse.ok) {
            console.error('Failed to fetch total income data');
            return;
          }

          const { data } = await incomeResponse.json();
          setIncomeData(data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        isFetched.current = true;
      };

      fetchData();
    }
  }, [sessionId]);

  const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);

  // ฟังก์ชันสำหรับจัดรูปแบบตัวเลขให้มีคอมม่าหลักพัน โดยไม่มีทศนิยม
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <Container maxWidth={false}>
      <Typography variant="h6" gutterBottom>
        รายได้ทั้งหมด
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: '100%' }} aria-label="total income table">
          <TableHead>
            <TableRow>
              <TableCell>รายการ</TableCell>
              <TableCell align="right">จำนวนเงิน</TableCell>
              <TableCell>รายละเอียด</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incomeData.map((item, index) => (
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
                รวมรายรับทั้งหมด
              </TableCell>
              <TableCell align="right">
                {formatNumber(Math.round(totalIncome))}
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TotalIncome;
