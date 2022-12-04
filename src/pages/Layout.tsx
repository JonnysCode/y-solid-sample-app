import React from 'react';
import { Outlet } from 'react-router-dom';
import MySidebar from '../components/Sidebar';

const Layout = () => {
  return (
    <div className='flex flex-row w-screen h-screen bg-main'>
      <MySidebar className='m-2 shadow-xl ' />
      <div className='grow h-screen'>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
