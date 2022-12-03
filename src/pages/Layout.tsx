import React from 'react';
import { Outlet } from 'react-router-dom';
import MySidebar from '../components/Sidebar';

const Layout = () => {
  return (
    <div className='flex flex-row w-screen h-screen bg-zinc-50'>
      <MySidebar className='m-2 shadow-xl ' />
      <div className='grow'>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
