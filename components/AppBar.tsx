import * as React from 'react';
import { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';


const MyAppBar = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    // ดึง sessionID จากคุกกี้ในฝั่งไคลเอนต์
    const sessionId = Cookies.get('sessionID');
    console.log('Session ID:', sessionId);

    if (sessionId) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleButtonClick = async () => {
    if (isLoggedIn) {
      // Logout: ลบ sessionID ในคุกกี้และในฐานข้อมูล
      const sessionId = Cookies.get('sessionID');
      if (sessionId) {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });
        Cookies.remove('sessionID'); // ลบ sessionID จากคุกกี้
        setIsLoggedIn(false);
        router.push('/sign-in');
      }
    } else {
      // Login: ตรวจสอบ sessionID และเปลี่ยนเส้นทางไปยัง dashboard
      const sessionId = Cookies.get('sessionID');
      if (sessionId) {
        router.push('/dashboard');
      } else {
        router.push('/sign-in');
      }
    }
  };

  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }
      setDrawerOpen(open);
    };

  const drawerList = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem component="a" href="/">
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem component="a" href="/profile">
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem component="a" href="/settings">
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem component="a" href="/logout">
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            <Link href="/" legacyBehavior>
              <a style={{ color: 'white', textDecoration: 'none' }}>HOME</a>
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
        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          {drawerList()}
        </Drawer>
      </AppBar>
    </Box>
  );
};

export default MyAppBar;
