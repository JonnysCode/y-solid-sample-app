import {
  DocumentDuplicateIcon,
  ViewColumnsIcon,
  UserIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

import { Sidebar } from 'flowbite-react';

const MySidebar = (props) => {
  return (
    <div className='h-screen w-16 shadow-lg bg-white'>
      <Sidebar aria-label='Default sidebar example' className='w-16'>
        <Sidebar.Logo
          href='#'
          img='logo512.png'
          imgAlt='logo'
          className='ml-0 pl-0 h-12 mb-12'
        ></Sidebar.Logo>
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            <Sidebar.Item
              href='#'
              icon={ViewColumnsIcon}
              className='pl-8'
            ></Sidebar.Item>
            <Sidebar.Item
              href='#'
              icon={DocumentDuplicateIcon}
              className='pl-8'
            ></Sidebar.Item>
            <Sidebar.Item
              href='#'
              icon={UserGroupIcon}
              className='pl-8'
            ></Sidebar.Item>
            <Sidebar.Item
              href='#'
              icon={UserIcon}
              className='pl-8'
            ></Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </div>
  );
};

export default MySidebar;
