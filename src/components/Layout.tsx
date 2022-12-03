import React from 'react';
import MySidebar from './Sidebar';

type Props = {
  children: React.ReactNode;
};

const Layout = (props: Props) => {
  return (
    <div className='flex flex-row w-full h-screen bg-zinc-50'>
      <MySidebar className='h-screen w-16 shadow-lg border-r-4 border-indigo-500' />
      <div className=''>{props.children}</div>
    </div>
  );
};

export default Layout;
