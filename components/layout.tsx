// components/layout.tsx
import React, { useState } from 'react';
import MyAppBar from './AppBar';
import DrawerComponent from './DrawerComponent';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  return (
    <>
      <MyAppBar toggleDrawer={toggleDrawer} />
      <DrawerComponent open={drawerOpen} toggleDrawer={toggleDrawer} />
      <main>{children}</main>
    </>
  );
};

export default Layout;
