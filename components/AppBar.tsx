// components/AppBar.tsx
import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { useDrawer } from '@/context/DrawerContext';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const MyAppBar: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toggleDrawer } = useDrawer();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const sessionId = Cookies.get('sessionID');

    if (sessionId) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleToggleDrawer = () => {
    const sessionId = Cookies.get('sessionID');
    if (!sessionId) {
      setDialogOpen(true);
    } else {
      toggleDrawer();
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleButtonClick = async () => {
    if (isLoggedIn) {
      const sessionId = Cookies.get('sessionID');
      if (sessionId) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });
        Cookies.remove('sessionID');
        setIsLoggedIn(false);
        router.push('/sign-in');
      }
    } else {
      const sessionId = Cookies.get('sessionID');
      if (sessionId) {
        router.push('/dashboard');
      } else {
        router.push('/sign-in');
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
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
            <Link href="/" legacyBehavior>
              <a style={{ color: 'white', textDecoration: 'none' }}>โปรแกรมรายรับรายจ่าย</a>
            </Link>
          </Typography>

          <Link href="/sign-in" passHref>
            <Button
              color="inherit"
              sx={{ color: 'white' }}
              onClick={handleButtonClick}
            >
              {isLoggedIn ? 'Logout' : 'Login'}
            </Button>
          </Link>
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