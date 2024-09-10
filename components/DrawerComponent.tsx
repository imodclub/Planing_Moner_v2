// DrawerComponent.tsx
import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { useDrawer } from '@/context/DrawerContext';

const DrawerComponent: React.FC = () => {
  const { drawerOpen, toggleDrawer } = useDrawer();

  const drawerList = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer}
      onKeyDown={toggleDrawer}
    >
      <List>
        <ListItem component="a" href="/dashboard">
          <ListItemText primary="หน้าแรกผู้ใช้" />
        </ListItem>
        <ListItem component="a" href="/incomes-form">
          <ListItemText primary="บันทึกรายรับ" />
        </ListItem>
        <ListItem component="a" href="/expenses-form">
          <ListItemText primary="บันทึกรายจ่าย" />
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
    <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
      {drawerList()}
    </Drawer>
  );
};

export default DrawerComponent;