//ไฟล์ก่อนทำการเปลี่ยนแปลงการ Fetch Item
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
  timestamp?: string;
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

          const fetchIncomeItem = await fetch(`/api/income-list/${userId}`);

          if (!fetchIncomeItem.ok) {
            console.error('Failed to fetch user on incomes');
            return;
          }

          const fetchIncomeItemResponse = await fetchIncomeItem.json();
          console.log('ค่าที่ได้ จาก income-list ', fetchIncomeItemResponse);

          const items = fetchIncomeItemResponse.items;
          // ตรวจสอบว่าข้อมูลที่ได้รับเป็นอาร์เรย์
          if (!Array.isArray(items)) {
            console.error('Data is not an array');
            return;
          }
          // ค้นหารายการที่มีการบันทึกครั้งล่าสุด
          const latestItem = items.reduce(
            (latest: IncomeItem, item: IncomeItem) => {
              const latestTimestamp = new Date(latest.timestamp || 0);
              const itemTimestamp = new Date(item.timestamp || 0);
              return itemTimestamp > latestTimestamp ? item : latest;
            },
            items[0]
          );

          console.log('Latest Item:', latestItem);


          // ตรวจสอบและเพิ่มรายการใหม่
          setIncomeItems((prevItems: IncomeItem[]) => {
            const existingLabels = prevItems.map(
              (item: IncomeItem) => item.label
            );

            // ตรวจสอบว่า latestItem.items เป็นอาร์เรย์
            const newItems = Array.isArray(latestItem.items)
              ? latestItem.items.filter(
                  (item: IncomeItem) => !existingLabels.includes(item.label)
                )
              : [];

            // ใช้ console.log เพื่อตรวจสอบข้อมูลที่ถูกดึงมา
            console.log('Existing Labels:', existingLabels);
            console.log('New Items:', newItems);

            return [
              ...prevItems,
              ...newItems.map((item: IncomeItem) => ({
                label: item.label,
                amount: '',
                comment: '',
              })),
            ];
          });

        } catch (error) {
          console.error('Error fetching expense data:', error);
        }
        isFetched.current = true;
      };

      fetchUserId();
    }
  }, [sessionId, isFetched]); // Added isFetched to the dependency array


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

const handleAddItem = async () => {
  if (newItem.label && newItem.amount) {
    // อัปเดตรายการใน local state
    setIncomeItems([...incomeItems, newItem]);

    // สร้างข้อมูลใหม่เพื่อส่งไปยัง API
    const payload = {
      userId: userId, // คุณต้องใช้ userId ที่แท้จริงตรงนี้
      items: [...incomeItems, newItem], // รายการทั้งหมดที่จะบันทึก
    };

    try {
      // เรียก API เพื่อบันทึกข้อมูลไปยังฐานข้อมูล
      const response = await fetch('/api/income-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result.message); // แสดงผลลัพธ์ใน console
      } else {
        console.error('Failed to save income list');
      }
    } catch (error) {
      console.error('Error:', error);
    }

    // รีเซ็ตข้อมูล newItem
    setNewItem({ label: '', amount: '', comment: '' });
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
          items:incomeItems,
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
