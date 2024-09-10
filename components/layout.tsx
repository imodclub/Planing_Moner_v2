// Layout.tsx
import React from 'react';
import MyAppBar from './AppBar';
import DrawerComponent from './DrawerComponent';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <MyAppBar />
      <DrawerComponent />
      <main>{children}</main>
      </>
  );
};

export default Layout;