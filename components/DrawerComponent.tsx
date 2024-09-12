// DrawerComponent.tsx
import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import { useDrawer } from '@/context/DrawerContext';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SavingsIcon from '@mui/icons-material/Savings';
import LogoutIcon from '@mui/icons-material/Logout';

const StyledButton = styled(Button)(({ theme }) => ({
  justifyContent: 'flex-start',
  padding: theme.spacing(1, 2),
  textTransform: 'none',
  width: '100%',
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const DrawerComponent: React.FC = () => {
  const { drawerOpen, toggleDrawer } = useDrawer();

  const menuItems = [
    { text: 'หน้าแรกผู้ใช้', icon: <DashboardIcon />, href: '/dashboard' },
    { text: 'บันทึกรายรับ', icon: <AddCircleOutlineIcon />, href: '/incomes-form' },
    { text: 'บันทึกรายจ่าย', icon: <RemoveCircleOutlineIcon />, href: '/expenses-form' },
    { text: 'บันทึกเงินออม', icon: <SavingsIcon />, href: '/savings-form' },
  ];

  const drawerList = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer}
      onKeyDown={toggleDrawer}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <StyledButton
              startIcon={item.icon}
              component="a"
              href={item.href}
            >
              {item.text}
            </StyledButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <StyledButton
            startIcon={<LogoutIcon />}
            component="a"
            href="/logout"
          >
            Logout
          </StyledButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
      {drawerList()}
    </Drawer>
  );
};

export default DrawerComponent;