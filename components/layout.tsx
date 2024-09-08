import React from 'react';
import MyAppBar from './AppBar';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <MyAppBar />
            <main>{children}</main>
        </div>
    );
};

export default Layout;