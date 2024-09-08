import React, { useState, useEffect, useRef } from 'react';
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

const SavingsForm = () => {
  const [date, setDate] = useState(dayjs());
  const [savingsItems, setSavingsItems] = useState([
    { label: 'เงินฝาก', amount: '', comment: '' },
    { label: 'ค่าหุ้น', amount: '', comment: '' },
    { label: 'กองทุน', amount: '', comment: '' },
  ]);

  const [newItem, setNewItem] = useState({
    label: '',
    amount: '',
    comment: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  const handleAmountChange = (index, value) => {
    const updatedItems = [...savingsItems];
    updatedItems[index].amount = value.replace(/,/g, '');
    setSavingsItems(updatedItems);
  };

  const formatAmount = (amount) => {
    return amount ? amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  };

  const handleCommentChange = (index, value) => {
    const updatedItems = [...savingsItems];
    updatedItems[index].comment = value;
    setSavingsItems(updatedItems);
  };

  const handleAddItem = () => {
    if (newItem.label && newItem.amount) {
      setSavingsItems([...savingsItems, newItem]);
      setNewItem({ label: '', amount: '', comment: '' });
    }
  };

  const handleDeleteItem = (index) => {
    const updatedItems = savingsItems.filter((_, i) => i !== index);
    setSavingsItems(updatedItems);
  };

  const handleSave = async () => {
    
    const userId = localStorage.getItem('userId');

    if (!userId) {
      setDialogOpen(true);
      return;
    }

    const formattedDate = date.toISOString().split('T')[0];
    const timestamp = new Date().toISOString();

    const response = await fetch(`${apiURL}/save-savings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: formattedDate,
        savingsItems,
        userId,
        timestamp,
      }),
    });

    if (response.ok) {
      setSuccessDialogOpen(true);
      setSavingsItems([
        { label: 'เงินฝาก', amount: '', comment: '' },
        { label: 'ค่าหุ้น', amount: '', comment: '' },
        { label: 'กองทุน', amount: '', comment: '' },
      ]);
    }
  };
  const isFetched = useRef(false);

  useEffect(() => {
    const fetchSavingsData = async () => {

      const userId = localStorage.getItem('userId');

      if (!userId) {
        console.error('No userId found in LocalStorage');
        return;
      }
      if (!isFetched.current) {
      try {
        const response = await fetch(
          `https://planing-money.vercel.app/api/savings/${userId}`
        );
        if (response.ok) {
          const data = await response.json();

          if (data.length > 0) {
            const latestDocument = data[data.length - 1];
            

            const newSavingsItems = latestDocument.items.map((item) => ({
              label: item.label,
              amount: '',
              comment: '',
            }));

            const existingLabels = savingsItems.map((item) => item.label);
            const uniqueItems = newSavingsItems.filter(
              (item) => !existingLabels.includes(item.label)
            );

            setSavingsItems([...savingsItems, ...uniqueItems]);
          } else {
            console.log('No documents found for this userId.');
          }
        } else {
          console.error('Error fetching savings data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching savings data:', error);
      }
      isFetched.current = true;
    }
    };

    fetchSavingsData();
  }, [savingsItems]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleCloseSuccessDialog = () => {
    setSuccessDialogOpen(false);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h6" gutterBottom>
        บันทึกเงินออม
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
      {savingsItems.map((item, index) => (
        <Grid container spacing={2} key={index} sx={{ marginTop: 2 }}>
          <Grid item xs={3}>
            <Typography variant="body1" color="black">
              {item.label}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="จำนวนเงิน"
              value={formatAmount(item.amount)}
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

      <Dialog open={successDialogOpen} onClose={handleCloseSuccessDialog}>
        <DialogTitle>บันทึกสำเร็จ</DialogTitle>
        <DialogContent>
          <Typography>บันทึกข้อมูลเงินออมสำเร็จ!</Typography>
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

export default SavingsForm;
