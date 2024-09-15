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

const SavingForm: React.FC = () => {
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [savingItems, setSavingItems] = useState<SavingItem[]>([
    { label: 'เงินฝาก', amount: '', comment: '' },
    { label: 'เงินลงทุนหุ้นระยะยาว', amount: '', comment: '' },
    { label: 'เงินลงทุนหุ้น DCA', amount: '', comment: '' },
  ]);
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

  const fetchSavingItems = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    const saveDefaultItems = async (items: SavingItem[]) => {
       console.log('Fetching saving items from:', `/api/saving-list/${userId}`);
      try {
        const response = await fetch('/api/saving-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            items: items,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to save default items');
        }
      } catch (error) {
        console.error('Error saving default items:', error);
      }
    };

    try {
      const response = await fetch(`/api/saving-list/${userId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          // ตรวจสอบและรวมรายการที่มีอยู่แล้วกับรายการใหม่
          const existingLabels = data.items.map(
            (item: SavingItem) => item.label
          );
          const newDefaultItems = savingItems.filter(
            (item: SavingItem) => !existingLabels.includes(item.label)
          );
          setSavingItems([...data.items, ...newDefaultItems]);
        } else {
          // ไม่พบข้อมูล ทำการบันทึกรายการเริ่มต้น
          const defaultItems = [
            { label: 'เงินฝาก', amount: '', comment: '' },
            { label: 'เงินลงทุนหุ้นระยะยาว', amount: '', comment: '' },
            { label: 'เงินลงทุนหุ้น DCA', amount: '', comment: '' },
          ];
          await saveDefaultItems(defaultItems);
          setSavingItems(defaultItems);
        }
      } else {
        throw new Error('Failed to fetch saving items');
      }
    } catch (error) {
      console.error('Error fetching saving items:', error);
      setError('Failed to load saving items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [userId, savingItems]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchSavingItems();
    } else {
      setLoading(false);
      setSavingItems([
        { label: 'เงินฝาก', amount: '', comment: '' },
        { label: 'เงินลงทุนหุ้นระยะยาว', amount: '', comment: '' },
        { label: 'เงินลงทุนหุ้น DCA', amount: '', comment: '' },
      ]);
    }
  }, [fetchSavingItems, isLoggedIn, userId]);

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
      setSavingItems([...savingItems, newItem]);
      try {
        const response = await fetch('/api/saving-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            items: [...savingItems, newItem],
          }),
        });
        if (response.ok) {
          console.log('Saving list saved successfully');
        } else {
          console.error('Failed to save saving list');
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
      const updatedItems = savingItems.filter((_, i) => i !== index);
      setSavingItems(updatedItems);
      const response = await fetch(`/api/saving-list/${userId}`, {
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
      setSavingItems([...savingItems]);
    }
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
        setSavingItems([
          { label: 'เงินฝาก', amount: '', comment: '' },
          { label: 'เงินลงทุนหุ้นระยะยาว', amount: '', comment: '' },
          { label: 'เงินลงทุนหุ้น DCA', amount: '', comment: '' },
        ]);
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
    <Container>
      <Typography variant="h4" gutterBottom>
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
      {savingItems.map((item, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TextField
            label={item.label}
            value={item.amount}
            onChange={(e) => handleAmountChange(index, e.target.value)}
            fullWidth
            sx={{ mr: 2 }}
          />
          <TextField
            label="หมายเหตุ"
            value={item.comment}
            onChange={(e) => handleCommentChange(index, e.target.value)}
            fullWidth
            sx={{ mr: 2 }}
          />
          <IconButton onClick={() => handleDeleteItem(index)} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}
      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        fullWidth
        sx={{ mt: 2, mb: 2 }}
      >
        บันทึกรายการ
      </Button>
      <Typography variant="body2" gutterBottom>
        รายการอื่นๆเพิ่มเติม ให้เพิ่มรายการแล้วกดที่
        &ldquo;ปุ่มเพิ่มรายการ&ldquo; ก่อนแล้วจึงกด
        &ldquo;บันทึกรายการอีกครั้ง&ldquo;
      </Typography>
      <TextField
        label="รายการ"
        value={newItem.label}
        onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="จำนวนเงิน"
        value={newItem.amount}
        onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="หมายเหตุ"
        value={newItem.comment}
        onChange={(e) => setNewItem({ ...newItem, comment: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button
        variant="contained"
        color="secondary"
        startIcon={<AddCircleIcon />}
        onClick={handleAddItem}
        fullWidth
      >
        เพิ่มรายการ
      </Button>
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
          <Typography>บันทึกข้อมูลเงินออมสำเร็จ!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog}>ตกลง</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SavingForm;
