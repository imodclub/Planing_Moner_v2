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

interface AppBarProps {
  toggleDrawer: (
    open: boolean
  ) => (event: React.KeyboardEvent | React.MouseEvent) => void;
}

const MyAppBar: React.FC<AppBarProps> = ({ toggleDrawer }) => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const sessionId = Cookies.get('sessionID');
    console.log('Session ID:', sessionId);

    if (sessionId) {
      setIsLoggedIn(true);
    }
  }, []);

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
      </AppBar>
    </Box>
  );
};

export default MyAppBar;
