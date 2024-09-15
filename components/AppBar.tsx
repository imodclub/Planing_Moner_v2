import React, { useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useDrawer } from '@/context/DrawerContext';
import { useAuth } from '@/context/AuthContext';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Cookies from 'js-cookie';



const MyAppBar: React.FC = () => {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuth();
  const { toggleDrawer } = useDrawer();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleToggleDrawer = () => {
    if (isLoggedIn) {
      toggleDrawer();
    } else {
      setDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

   const handleLogout = async () => {
     try {
       // เรียก API เพื่อทำ logout ที่ server-side
       await fetch('/api/logout', { method: 'POST' });

       // ลบ cookie ทั้งหมด
       const cookies = Cookies.get();
       for (const cookie in cookies) {
         Cookies.remove(cookie);
       }

       // เรียกใช้ฟังก์ชัน logout จาก AuthContext
       logout();

       // Redirect ไปยังหน้า login
       router.push('/login');
     } catch (error) {
       console.error('Logout failed:', error);
     }
   };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleToggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Button href="/" component="a" sx={{ color: 'white', textDecoration: 'none' }} LinkComponent={NextLink}>
              โปรแกรมรายรับรายจ่าย
            </Button>
          </Typography>
          <Button
            color="inherit"
            onClick={isLoggedIn ? handleLogout : handleLogin}
          >
            {isLoggedIn ? 'Logout' : 'Login'}
          </Button>
        </Toolbar>
      </AppBar>
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>กรุณาลงชื่อเข้าระบบ</DialogTitle>
        <DialogContent>
          <DialogContentText>
            กรุณาลงชื่อเข้าระบบเพื่อใช้งานฟังก์ชันนี้
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            ตกลง
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyAppBar;
