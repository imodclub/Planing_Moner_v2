// DrawerComponent.tsx
import React from 'react';
import Link from 'next/link';
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
import { Summarize } from '@mui/icons-material';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AssessmentIcon from '@mui/icons-material/Assessment';

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  href: string;
  closeDrawer?: boolean;
}

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
  const [reportsOpen, setReportsOpen] = React.useState(false);

  const menuItems:MenuItem[] = [
    { text: 'หน้าแรกผู้ใช้', icon: <DashboardIcon />, href: '/dashboard', closeDrawer: true, },
    {
      text: 'บันทึกรายรับ',
      icon: <AddCircleOutlineIcon />,
      href: '/incomes-form',
      closeDrawer: true,
    },
    {
      text: 'บันทึกรายจ่าย',
      icon: <RemoveCircleOutlineIcon />,
      href: '/expenses-form',
      closeDrawer: true,
    },
    { text: 'บันทึกเงินออม', icon: <SavingsIcon />, href: '/savings-form',closeDrawer: true, },
  ];

  const reportItems = [
    { text: 'รายงานรายรับ', href: '/report-income' },
    { text: 'รายงานรายจ่าย', href: '/report-expense' },
    { text: 'รายงานเงินออม', href: '/report-saving' },
    { text: 'รายงานที่กำหนดเอง', href: '/reports/custom' },
  ];
  
  const handleReportsClick = (event: React.MouseEvent | undefined) => {
    event?.stopPropagation(); // ใช้ optional chaining
    setReportsOpen(!reportsOpen);
  };

  const drawerList = () => (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
          toggleDrawer();
        }
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
          toggleDrawer();
        }
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <Link
              href={item.href}
              passHref
              style={{ textDecoration: 'none', width: '100%' }}
            >
              <StyledButton 
                startIcon={item.icon}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  if (item.closeDrawer) {
                    toggleDrawer();
                  }
                }}
              >
                {item.text}
              </StyledButton>
            </Link>
          </ListItem>
        ))}
      <ListItemButton onClick={handleReportsClick}>
        <ListItemIcon>
          <Summarize />
        </ListItemIcon>
        <ListItemText primary="รายงาน" />
        {reportsOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={reportsOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {reportItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ pl: 4 }}>
              <Link href={item.href} passHref style={{ textDecoration: 'none', width: '100%' }}>
                <StyledButton startIcon={<AssessmentIcon />}  onClick={(e: React.MouseEvent) => e.stopPropagation()}>{item.text}</StyledButton>
              </Link>
            </ListItem>
          ))}
        </List>
      </Collapse>
    </List>
    <Divider />
      <List>
        <ListItem disablePadding>
          <Link
            href="/logout"
            passHref
            style={{ textDecoration: 'none', width: '100%' }}
          >
            <StyledButton
              startIcon={<LogoutIcon />}
              href="/logout"
            >
              Logout
            </StyledButton>
          </Link>
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