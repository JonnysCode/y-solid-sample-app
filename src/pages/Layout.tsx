import React from 'react';
import { Outlet } from 'react-router-dom';
import MySidebar from '../components/Sidebar';

const Layout = () => {
  return (
    <div className='flex flex-row w-screen h-screen bg-main'>
      <MySidebar className='border-r-2 border-black' />
      <div className='grow h-screen overflow-auto'>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
