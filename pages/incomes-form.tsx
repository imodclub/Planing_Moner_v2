// components/IncomesForm.tsx

import React, { useState, useEffect, useCallback } from 'react';
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
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useAuth } from '@/context/AuthContext';

interface IncomeItem {
  label: string;
  amount: string;
  comment: string;
}


const IncomesForm: React.FC = () => {
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([]);
  const [newItem, setNewItem] = useState<IncomeItem>({
    label: '',
    amount: '',
    comment: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoggedIn } = useAuth();
  const userId = user?.userId;


  const fetchIncomeItems = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/incomes/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.incomes && data.incomes.length > 0) {
          setIncomeItems(data.incomes[0].items);
          setDate(dayjs(data.incomes[0].date));
        } else {
          setIncomeItems([]);
        }
      } else {
        throw new Error('Failed to fetch income items');
      }
    } catch (error) {
      console.error('Error fetching income items:', error);
      setError('Failed to load income items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchIncomeItems();
    } else {
      setLoading(false);
    }
  }, [fetchIncomeItems, isLoggedIn, userId]);

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography>Error: {error}</Typography>;
  }

  if (!isLoggedIn || !userId) {
    return <Typography>Please log in to access this form.</Typography>;
  }

  const handleAmountChange = (index: number, value: string) => {
    const updatedItems = [...incomeItems];
    updatedItems[index].amount = value.replace(/,/g, '');
    setIncomeItems(updatedItems);
  };

  const formatAmount = (amount: string | number | undefined) => {
    if (typeof amount === 'number') {
      amount = amount.toString();
    }
    return amount && typeof amount === 'string'
      ? amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      : '';
  };

  const handleCommentChange = (index: number, value: string) => {
    const updatedItems = [...incomeItems];
    updatedItems[index].comment = value;
    setIncomeItems(updatedItems);
  };

  const handleAddItem = async () => {
    if (newItem.label && newItem.amount && userId) {
      setIncomeItems([...incomeItems, newItem]);
      try {
        const response = await fetch('/api/income-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            items: [...incomeItems, newItem],
          }),
        });
        if (response.ok) {
          console.log('Income list saved successfully');
        } else {
          console.error('Failed to save income list');
        }
      } catch (error) {
        console.error('Error:', error);
      }
      setNewItem({ label: '', amount: '', comment: '' });
    }
  };

  const handleDeleteItem = async (index: number) => {
    if (!userId) return;
    try {
      const updatedItems = incomeItems.filter((_, i) => i !== index);
      setIncomeItems(updatedItems);
      const response = await fetch(`/api/income-list/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ index }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      console.log('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      setIncomeItems([...incomeItems]);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      setDialogOpen(true);
      return;
    }
    try {
      const formattedDate = date.format('YYYY-MM-DD');
      const response = await fetch(`/api/incomes/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formattedDate,
          items: incomeItems,
          timestamp: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        setSuccessDialogOpen(true);
        fetchIncomeItems(); // Refresh the income items after saving
      } else {
        throw new Error('Failed to save incomes');
      }
    } catch (error) {
      console.error('Error saving incomes:', error);
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => setDialogOpen(false);
  const handleCloseSuccessDialog = () => setSuccessDialogOpen(false);

  if (!isLoggedIn) {
    return <Typography>กรุณาเข้าสู่ระบบเพื่อบันทึกรายรับ</Typography>;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          บันทึกรายรับของคุณ
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="วันที่บันทึก"
            value={date}
            onChange={(newValue: Dayjs | null) => {
              if (newValue) setDate(newValue);
            }}
            slots={{
              textField: (params) => <TextField {...params} fullWidth />,
            }}
          />
        </LocalizationProvider>
        <Box sx={{ mt: 2 }}>
          {incomeItems.map((item, index) => (
            <Box key={index} display="flex" alignItems="center" my={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant={'inherit'}>{item.label}</Typography>
                  <TextField
                    label="จำนวนเงิน"
                    value={formatAmount(item.amount)}
                    onChange={(e) => handleAmountChange(index, e.target.value)}
                    fullWidth
                    sx={{ mr: 2, mt: 2 }}
                  />
                  <TextField
                    label="หมายเหตุ"
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
            <Typography variant="subtitle2" mt={2}>
              รายการอื่นๆเพิ่มเติม ให้เพิ่มรายการแล้วกดที่
              &ldquo;ปุ่มเพิ่มรายการ&ldquo; ก่อนแล้วจึงกด
              &ldquo;บันทึกรายการอีกครั้ง&ldquo;
            </Typography>
            <TextField
              label="รายการ"
              value={newItem.label}
              onChange={(e) =>
                setNewItem({ ...newItem, label: e.target.value })
              }
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="จำนวนเงิน"
              value={newItem.amount}
              onChange={(e) =>
                setNewItem({ ...newItem, amount: e.target.value })
              }
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="หมายเหตุ"
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
            color="secondary"
            startIcon={<AddCircleIcon />}
            onClick={handleAddItem}
            fullWidth
          >
            เพิ่มรายการ
          </Button>
        </Box>
      </Box>
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>ข้อผิดพลาด</DialogTitle>
        <DialogContent>
          <Typography>ไม่พบ userId กรุณาลงชื่อเข้าใช้ใหม่</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ตกลง</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={successDialogOpen} onClose={handleCloseSuccessDialog}>
        <DialogTitle>บันทึกสำเร็จ</DialogTitle>
        <DialogContent>
          <Typography>บันทึกข้อมูลรายได้สำเร็จ!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog}>ตกลง</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default IncomesForm;
