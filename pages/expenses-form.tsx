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


interface ExpenseItem {
  label: string;
  amount: string;
  comment: string;
}

const ExpensesForm:React.FC = () => {
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>([
    { label: 'ค่าผ่อนบ้าน', amount: '', comment: '' },
    { label: 'ค่าผ่อนรถ', amount: '', comment: '' },
    { label: 'ค่าผ่อนสหกรณ์', amount: '', comment: '' },
    { label: 'ค่าบัตรเครดิตสินเชื่อเงินสด', amount: '', comment: '' },
    { label: 'ค่าผ่อนสินค้า', amount: '', comment: '' },
    { label: 'ค่าไฟฟ้า', amount: '', comment: '' },
    { label: 'ค่าอินเตอร์เน็ตบ้าน', amount: '', comment: '' },
    { label: 'ค่าโทรศัพท์มือถือ', amount: '', comment: '' },
    { label: 'จ่ายลูกไปโรงเรียน', amount: '', comment: '' },
    { label: 'ค่าน้ำมัน', amount: '', comment: '' },
  ]);

  const [newItem, setNewItem] = useState<ExpenseItem>({
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

 
  const fetchExpenseItems = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/expense-list/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setExpenseItems(data.items);
      } else {
        throw new Error('Failed to fetch income items');
      }
    } catch (error) {
      console.error('Error fetching Expense items:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchExpenseItems();
    }
  }, [fetchExpenseItems, isLoggedIn, userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isLoggedIn || !userId) {
    return <div>Please log in to access this form.</div>;
  }


  const handleAmountChange = (index: number, value: string) => {
    const updatedItems = [...expenseItems];
    updatedItems[index].amount = value.replace(/,/g, '');
    setExpenseItems(updatedItems);
  };

  const formatAmount = (amount: string) => {
    return amount ? amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
  };

  const handleCommentChange = (index: number, value: string) => {
    const updatedItems = [...expenseItems];
    updatedItems[index].comment = value;
    setExpenseItems(updatedItems);
  };

  const handleAddItem = async () => {
    if (newItem.label && newItem.amount && userId) {
      setExpenseItems([...expenseItems, newItem]);
      try {
        const response = await fetch('/api/expense-list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            items: [...expenseItems, newItem],
          }),
        });
        if (response.ok) {
          console.log('Expense list saved successfully');
        } else {
          console.error('Failed to save Expense list');
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
      const updatedItems = expenseItems.filter((_, i) => i !== index);
      setExpenseItems(updatedItems);
      const response = await fetch(`/api/expense-list/${userId}`, {
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
      setExpenseItems([...expenseItems]);
    }
  };
  

  const handleSave = async () => {
    if (!userId) {
      setDialogOpen(true);
      return;
    }

    try {
      const formattedDate = date.format('YYYY-MM-DD');
      const response = await fetch(`/api/expense/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formattedDate,
          items: expenseItems,
          userId: userId,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSuccessDialogOpen(true);
        setExpenseItems([
          { label: 'ค่าผ่อนบ้าน', amount: '', comment: '' },
          { label: 'ค่าผ่อนรถ', amount: '', comment: '' },
          { label: 'ค่าผ่อนสหกรณ์', amount: '', comment: '' },
          { label: 'ค่าบัตรเครดิตสินเชื่อเงินสด', amount: '', comment: '' },
          { label: 'ค่าผ่อนสินค้า', amount: '', comment: '' },
          { label: 'ค่าไฟฟ้า', amount: '', comment: '' },
          { label: 'ค่าอินเตอร์เน็ตบ้าน', amount: '', comment: '' },
          { label: 'ค่าโทรศัพท์มือถือ', amount: '', comment: '' },
          { label: 'จ่ายลูกไปโรงเรียน', amount: '', comment: '' },
          { label: 'ค่าน้ำมัน', amount: '', comment: '' },
        ]);
      }
    } catch (error) {
      console.error('Error saving expenses:', error);
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
          บันทึกรายจ่ายของคุณ 
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
          {expenseItems.map((item, index) => (
            <Box
              sx={{ mt: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}
              key={index}
            >
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
                    label="รายละเอียด"
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
            <Typography variant={'inherit'} sx={{ mt: 2, p: 2 }}>
              รายการอื่นๆเพิ่มเติม ให้เพิ่มรายการแล้วกดที่
              &quot;ปุ่มเพิ่มรายการ&quot; ก่อนแล้วจึงกด
              &quot;บันทึกรายการอีกครั้ง&quot;
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
              label="รายละเอียด"
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
        <DialogContent>บันทึกข้อมูลรายจ่ายสำเร็จ!</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuccessDialog}>ตกลง</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExpensesForm;
