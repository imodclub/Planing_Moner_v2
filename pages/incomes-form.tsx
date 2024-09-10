import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
} from '@mui/material';
import Cookies from 'js-cookie';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

interface IncomeItem {
  label: string;
  amount: string;
  comment: string;
}

const IncomesForm = () => {
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([
    { label: 'เงินเดือน', amount: '', comment: '' },
    { label: 'โบนัส', amount: '', comment: '' },
    { label: 'รายได้เสริม', amount: '', comment: '' },
  ]);

  const [newItem, setNewItem] = useState<IncomeItem>({
    label: '',
    amount: '',
    comment: '',
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const isFetched = useRef(false);

  // ดึง sessionID จากคุกกี้เมื่อโหลดหน้า
  useEffect(() => {
    const sessionIdFromCookie = Cookies.get('sessionID');
    if (sessionIdFromCookie) {
      setSessionId(sessionIdFromCookie);
      console.log('Fetched sessionID from cookie:', sessionIdFromCookie);
    } else {
      console.error('No sessionId found in cookie');
    }
  }, []);

  // Fetch expense data เมื่อ sessionId ถูกตั้งค่า และ isFetched เป็น false
  useEffect(() => {
    if (sessionId && !isFetched.current) {
      const fetchUserId = async () => {
        try {
          // เรียก API เพื่อค้นหา userID จาก sessionID
          const userIdResponse = await fetch(`/api/session/${sessionId}`);
          if (!userIdResponse.ok) {
            console.error('Failed to fetch userID');
            return;
          }

          const { userId } = await userIdResponse.json();
          setUserId(userId);

          const userNameResponse = await fetch(`/api/users/${userId}`);
          if (!userNameResponse) {
            console.error('Failed to fetch userName');
            return;
          }

          const { name } = await userNameResponse.json();
          setUserName(name);

        } catch (error) {
          console.error('Error fetching expense data:', error);
        }
        isFetched.current = true;
      };

      fetchUserId();
    }
  }, [sessionId, isFetched]); // Added isFetched to the dependency array

  const fetchIncomeTypes = async (userId: string) => {
    try {
      const response = await fetch(`/api/income-type/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch income types');
      }
  
      const incomeTypes = await response.json();
      // ใช้ข้อมูล incomeTypes ในการจัดการต่อไป
      console.log(incomeTypes);
      // ตัวอย่าง: อัปเดตสถานะ state
      setIncomeItems((prevItems) => {
        const existingLabels = prevItems.map(item => item.label);
        const uniqueItems = incomeTypes.filter(
          (item: IncomeItem) => !existingLabels.includes(item.label)
        );
        return [...prevItems, ...uniqueItems];
      });
    } catch (error) {
      console.error('Error fetching income types:', error);
    }
  };
  
  // เรียกใช้ฟังก์ชันเมื่อจำเป็น เช่น ใน useEffect
  useEffect(() => {
    if (userId) {
      fetchIncomeTypes(userId);
    }
  }, [userId]);

  const handleAmountChange = (index: number, value: string) => {
    const updatedItems = [...incomeItems];
    updatedItems[index].amount = value.replace(/,/g, '');
    setIncomeItems(updatedItems);
  };

  const formatAmount = (amount: string) => {
    return amount ? amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  };

  const handleCommentChange = (index: number, value: string) => {
    const updatedItems = [...incomeItems];
    updatedItems[index].comment = value;
    setIncomeItems(updatedItems);
  };

  const handleAddItem = () => {
    if (newItem.label && newItem.amount) {
      // Save new item to database
      fetch('/api/save-income-type', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          incomeType: newItem,
        }),
      })
      .then(response => response.json())
      .then(() => {
        setIncomeItems([...incomeItems, newItem]);
        setNewItem({ label: '', amount: '', comment: '' });
      });
    }
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = incomeItems.filter((_, i) => i !== index);
    setIncomeItems(updatedItems);
  };

  const handleSave = async () => {
    if (!userId) {
      setDialogOpen(true);
      return;
    }

    try {
      const formattedDate = date.toISOString().split('T')[0];
      const timestamp = new Date().toISOString();
      const response = await fetch('/api/save-incomes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: formattedDate,
          incomeItems,
          userId, // ใช้ userId ที่เก็บไว้ใน state
          timestamp,
        }),
      });

      if (response.ok) {
        setSuccessDialogOpen(true);
        setIncomeItems([
          { label: 'เงินเดือน', amount: '', comment: '' },
          { label: 'โบนัส', amount: '', comment: '' },
          { label: 'รายได้เสริม', amount: '', comment: '' },
        ]);
      }
    } catch (error) {
      console.error('Error saving incomes:', error);
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          บันทึกรายรับ ของคุณ  {userName}
        </Typography>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="วันที่บันทึก"
          value={date}
          onChange={(newValue: Dayjs | null) => {
            if (newValue) setDate(newValue);
          }}
          slots={{ textField: (params) => <TextField {...params} fullWidth /> }}
        />
      </LocalizationProvider>
      <Box sx={{ mt: 2 }}>
        {incomeItems.map((item, index) => (
          <Box
            sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}
            key={index}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mt: 2 }}>
                <TextField
                  label={item.label}
                  value={formatAmount(item.amount)}
                  onChange={(e) => handleAmountChange(index, e.target.value)}
                  fullWidth
                  sx={{ mr: 2, mt: 2 }}
                />
                <TextField
                  label="Comment"
                  value={item.comment}
                  onChange={(e) => handleCommentChange(index, e.target.value)}
                  fullWidth
                  sx={{ mr: 2, mt: 2 }}
                />
                <IconButton
                  onClick={() => handleDeleteItem(index)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      <Button
        variant="contained"
        color="success"
        onClick={handleSave}
        fullWidth
        sx={{ mt: 2 }}
      >
        บันทึกรายการ
      </Button>

      <Box sx={{ mt: 4, p: 2, border: '1px solid #e43733', borderRadius: 2 }}>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="New Item Label"
            value={newItem.label}
            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="New Item Amount"
            value={newItem.amount}
            onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="New Item Comment"
            value={newItem.comment}
            onChange={(e) =>
              setNewItem({ ...newItem, comment: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
          />
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleIcon />}
          onClick={handleAddItem}
          fullWidth
          sx={{ mt: 2 }}
        >
          เพิ่มรายการ
        </Button>
        </Box>
        </Box>
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>ข้อผิดพลาด</DialogTitle>
        <DialogContent>ไม่พบ userId กรุณาลงชื่อเข้าใช้ใหม่</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ตกลง</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={successDialogOpen} onClose={handleCloseSuccessDialog}>
        <DialogTitle>บันทึกสำเร็จ</DialogTitle>
        <DialogContent>บันทึกข้อมูลรายได้สำเร็จ!</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog}>ตกลง</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default IncomesForm;
