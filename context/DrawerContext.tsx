// DrawerContext.ts
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface DrawerContextProps {
  drawerOpen: boolean;
  toggleDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextProps | undefined>(undefined);

export const DrawerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <DrawerContext.Provider value={{ drawerOpen, toggleDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
};

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};

export default DrawerContext;