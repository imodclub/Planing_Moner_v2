// Layout.tsx
import React from 'react';
import { styled } from '@mui/material/styles';
import MyAppBar from './AppBar';
import DrawerComponent from './DrawerComponent';

interface LayoutProps {
  children: React.ReactNode;
}
const Content = styled('div')(({ theme }) => ({
  paddingTop: theme.mixins.toolbar.minHeight,
}));

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <MyAppBar />
      <Content>
      <DrawerComponent />
      <main>{children}</main>
      </Content>
      </>
  );
};

export default Layout;