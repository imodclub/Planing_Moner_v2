// components/DrawerComponent.tsx
import React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';

interface DrawerComponentProps {
  open: boolean;
  toggleDrawer: (
    open: boolean
  ) => (event: React.KeyboardEvent | React.MouseEvent) => void;
}

const DrawerComponent: React.FC<DrawerComponentProps> = ({
  open,
  toggleDrawer,
}) => {
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
    <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
      {drawerList()}
    </Drawer>
  );
};

export default DrawerComponent;
