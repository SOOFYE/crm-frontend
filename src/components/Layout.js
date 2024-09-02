import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-grow p-8 bg-gray-100">
          <Outlet /> {/* This renders the content of the current route */}
        </div>
      </div>
    );
  };

export default Layout;