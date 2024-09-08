// components/IncomeForm.js
import React, { useState, useEffect,useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import apiURL from '../config/Config';

const IncomeForm = () => {
  const [date, setDate] = useState(dayjs());
  const [incomeItems, setIncomeItems] = useState([
    { label: 'เงินเดือน', amount: '', comment: '' },
    { label: 'รายได้จากขายสินค้า', amount: '', comment: '' },
    { label: 'รายได้จากค่าเช่า', amount: '', comment: '' },
    { label: 'ดอกเบี้ยและเงินปันผล', amount: '', comment: '' },
  ]);

  const [newItem, setNewItem] = useState({
    label: '',
    amount: '',
    comment: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false); // State สำหรับ Dialog
  const [successDialogOpen, setSuccessDialogOpen] = useState(false); // State สำหรับ Dialog บันทึกสำเร็จ

  const handleAmountChange = (index, value) => {
    const updatedItems = [...incomeItems];
    updatedItems[index].amount = value.replace(/,/g, ''); // Remove commas for processing
    setIncomeItems(updatedItems);
  };

  const formatAmount = (amount) => {
    // ฟังก์ชันสำหรับจัดรูปแบบจำนวนเงินด้วยคอมม่า
    return amount ? amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''; // ตรวจสอบว่า amount มีค่า
  };

  const handleCommentChange = (index, value) => {
    const updatedItems = [...incomeItems];
    updatedItems[index].comment = value;
    setIncomeItems(updatedItems);
  };

  const handleAddItem = () => {
    // ตรวจสอบว่ารายการใหม่ไม่ว่างเปล่า
    if (newItem.label && newItem.amount) {
      setIncomeItems([...incomeItems, newItem]);
      setNewItem({ label: '', amount: '', comment: '' }); // เคลียร์ฟอร์ม
    }
  };

  const handleDeleteItem = (index) => {
    const updatedItems = incomeItems.filter((_, i) => i !== index);
    setIncomeItems(updatedItems);
  };

  const handleSave = async () => {
    
    const userId = localStorage.getItem('userId'); // ดึง userId จาก LocalStorage

    if (!userId) {
      setDialogOpen(true); // เปิด Dialog หากไม่พบ userId
      return;
    }

    //ดึงข้อมูลที่มีตามวันในฐานข้อมูลออกมาเพื่อแก้ไข
    const fetchIncomeDataByDate = async (selectedDate) => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No userId found in LocalStorage');
        return;
      }

      try {
        const formattedDate = selectedDate.format('YYYY-MM-DD');
        const response = await fetch(
          `${apiURL}/income-data/${userId}/${formattedDate}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data && data.items) {
            setIncomeItems(data.items);
          } else {
            // ถ้าไม่มีข้อมูลสำหรับวันที่นี้ ให้ตั้งค่าเป็นรายการว่าง
            setIncomeItems([
              { label: 'เงินเดือน', amount: '', comment: '' },
              { label: 'รายได้จากขายสินค้า', amount: '', comment: '' },
              { label: 'รายได้จากค่าเช่า', amount: '', comment: '' },
              { label: 'ดอกเบี้ยและเงินปันผล', amount: '', comment: '' },
            ]);
          }
        } else {
          console.error('Error fetching income data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching income data:', error);
      }
    };

    //แก้ไขการดึงวันที่
    const handleDateChange = (newValue) => {
      setDate(newValue);
      fetchIncomeDataByDate(newValue);
    };

    const formattedDate = date.toISOString().split('T')[0];
    const timestamp = new Date().toISOString();
    const response = await fetch(`${apiURL}/save-income`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date: formattedDate, incomeItems, userId, timestamp }), 
    });

    if (response.ok) {
      setSuccessDialogOpen(true); // เปิด Dialog บันทึกสำเร็จ
      // เคลียร์ฟอร์มและรีโหลดฟอร์ม
      setIncomeItems([
        { label: 'เงินเดือน', amount: '', comment: '' },
        { label: 'รายได้จากขายสินค้า', amount: '', comment: '' },
        { label: 'รายได้จากค่าเช่า', amount: '', comment: '' },
        { label: 'ดอกเบี้ยและเงินปันผล', amount: '', comment: '' },
      ]);
    }
  };

  const isFetched = useRef(false);

  useEffect(() => {
    const fetchIncomeData = async () => {
    
      const userId = localStorage.getItem('userId'); // ดึง userId จาก LocalStorage
  
      if (!userId) {
        console.error('No userId found in LocalStorage');
        return;
      }
      
      if(!isFetched.current){
      try {
        const response = await fetch(`${apiURL}/income-data/${userId}`); // ดึงข้อมูลตาม userId
        if (response.ok) {
          const data = await response.json();
          // แสดงค่าที่ดึงมาจาก MongoDB ใน Console
  
          // ตรวจสอบว่ามีเอกสารหรือไม่
          if (data.length > 0) {
            // ดึงข้อมูลเอกสารล่าสุด
            const latestDocument = data[data.length - 1]; // สมมติว่าข้อมูลเรียงตามวันที่
  
            // สร้าง incomeItems ใหม่จาก label ที่มีอยู่ในฐานข้อมูล
            const newIncomeItems = latestDocument.items.map(item => ({
              label: item.label,
              amount: '',
              comment: '',
            }));
  
            // ตรวจสอบว่ามี label ใดที่ไม่ซ้ำกับที่มีอยู่แล้ว
            const existingLabels = incomeItems.map(item => item.label);
            const uniqueItems = newIncomeItems.filter(item => !existingLabels.includes(item.label));
  
            // รวม incomeItems ที่มีอยู่แล้วกับ uniqueItems
            setIncomeItems([...incomeItems, ...uniqueItems]);
          } else {
            console.log('No documents found for this userId.');
          }
        } else {
          console.error('Error fetching income data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching income data:', error);
      }
      isFetched.current=true;
    }
    };
  
    fetchIncomeData();
  }, [incomeItems]);

  const handleCloseDialog = () => {
    setDialogOpen(false); // ปิด Dialog
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false); // ปิด Dialog บันทึกสำเร็จ
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        บันทึกรายได้
      </Typography>
      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid item xs={3}>
          <Typography variant="body1" color="black">
            วันที่บันทึก
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={date}
              onChange={(newValue) => setDate(newValue)} 
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
      {incomeItems.map((item, index) => (
        <Grid container spacing={2} key={index} sx={{ marginTop: 2 }}>
          <Grid item xs={3}>
            <Typography variant="body1" color="black">
              {item.label}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="จำนวนเงิน"
              value={formatAmount(item.amount)} // แสดงจำนวนเงินที่มีคอมม่า
              onChange={(e) => handleAmountChange(index, e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="รายละเอียดเพิ่มเติม"
              value={item.comment}
              onChange={(e) => handleCommentChange(index, e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <IconButton onClick={() => handleDeleteItem(index)} color="error">
              <DeleteIcon />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Grid container spacing={2} sx={{ marginTop: 2 }}>
        <Grid item xs={3}>
          <TextField
            label="รายการใหม่"
            value={newItem.label}
            onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
            fullWidth
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            label="จำนวนเงิน"
            value={newItem.amount}
            onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
            fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <TextField
            label="รายละเอียดเพิ่มเติม"
            value={newItem.comment}
            onChange={(e) =>
              setNewItem({ ...newItem, comment: e.target.value })
            }
            fullWidth
          />
        </Grid>
        <Grid item xs={2}>
          <Button
            variant="contained"
            onClick={handleAddItem}
            color="success"
            startIcon={<AddCircleIcon />}
            fullWidth
          >
            เพิ่มรายการ
          </Button>
        </Grid>
      </Grid>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        sx={{ marginTop: 2 }}
      >
        บันทึกรายการ
      </Button>

      {/* Dialog สำหรับแจ้งเตือนเมื่อไม่พบ userId */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>ข้อผิดพลาด</DialogTitle>
        <DialogContent>
          <Typography>ไม่พบ userId กรุณาลงชื่อเข้าใช้ใหม่</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            ตกลง
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog สำหรับบันทึกข้อมูลสำเร็จ */}
      <Dialog open={successDialogOpen} onClose={handleCloseSuccessDialog}>
        <DialogTitle>บันทึกสำเร็จ</DialogTitle>
        <DialogContent>
          <Typography>บันทึกข้อมูลรายได้สำเร็จ!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog} color="primary">
            ตกลง
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IncomeForm;