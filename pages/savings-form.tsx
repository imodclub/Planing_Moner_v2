// components/SavingForm.tsx

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

interface SavingItem {
  label: string;
  amount: string;
  comment: string;
}

const defaultSavingItems: SavingItem[] = [
  { label: 'เงินฝาก', amount: '', comment: '' },
  { label: 'เงินฝากเงินหุ้นระยะยาว', amount: '', comment: '' },
  { label: 'ลงทุนหุ้นหรือ DCA', amount: '', comment: '' },
];

const SavingForm: React.FC = () => {
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [savingItems, setSavingItems] =
    useState<SavingItem[]>(defaultSavingItems);
  const [newItem, setNewItem] = useState<SavingItem>({
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

  const fetchLatestSavingList = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/saving-list/${userId}/latest`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.items) {
          const existingLabels = savingItems.map((item) => item.label);
          const newItems = data.items.filter(
            (item: SavingItem) => !existingLabels.includes(item.label)
          );
          setSavingItems([...savingItems, ...newItems]);
        }
      } else {
        throw new Error('Failed to fetch latest saving list');
      }
    } catch (error) {
      console.error('Error fetching latest saving list:', error);
      setError('Failed to load saving items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId, savingItems]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchLatestSavingList();
    } else {
      setLoading(false);
    }
  }, [fetchLatestSavingList, isLoggedIn, userId]);

  const handleAmountChange = (index: number, value: string) => {
    const updatedItems = [...savingItems];
    updatedItems[index].amount = value.replace(/,/g, '');
    setSavingItems(updatedItems);
  };

  const handleCommentChange = (index: number, value: string) => {
    const updatedItems = [...savingItems];
    updatedItems[index].comment = value;
    setSavingItems(updatedItems);
  };

  const handleAddItem = async () => {
    if (newItem.label && newItem.amount && userId) {
      try {
        const response = await fetch('/api/saving-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            items: [newItem],
          }),
        });
        if (response.ok) {
          console.log('New item added to saving list successfully');
          setSavingItems([...savingItems, newItem]);
          setNewItem({ label: '', amount: '', comment: '' });
          fetchLatestSavingList(); // Fetch updated list
        } else {
          console.error('Failed to add new item to saving list');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = savingItems.filter((_, i) => i !== index);
    setSavingItems(updatedItems);
  };

  const handleSave = async () => {
    if (!userId) {
      setDialogOpen(true);
      return;
    }
    try {
      const formattedDate = date.format('YYYY-MM-DD');
      const response = await fetch(`/api/saving/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formattedDate,
          items: savingItems,
          userId: userId,
          timestamp: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        setSuccessDialogOpen(true);
        // Reset form after successful save
        setSavingItems(defaultSavingItems);
        setDate(dayjs());
      } else {
        throw new Error('Failed to save savings');
      }
    } catch (error) {
      console.error('Error saving savings:', error);
      setDialogOpen(true);
    }
  };

  const handleCloseDialog = () => setDialogOpen(false);
  const handleCloseSuccessDialog = () => setSuccessDialogOpen(false);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isLoggedIn || !userId) {
    return <div>Please log in to access this form.</div>;
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          บันทึกเงินออมของคุณ
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
          {savingItems.map((item, index) => (
            <Box key={index} display="flex" alignItems="center" my={2}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant={'inherit'}>{item.label}</Typography>
                  <TextField
                    label="จำนวนเงิน"
                    value={item.amount}
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

export default SavingForm;
