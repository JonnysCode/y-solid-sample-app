import {
  DocumentDuplicateIcon,
  ViewColumnsIcon,
  UserIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

import { Sidebar } from 'flowbite-react';
import { Link } from 'react-router-dom';

const MySidebar = (props) => {
  return (
    <Sidebar
      aria-label='Default sidebar example'
      collapsed
      className={props.className}
    >
      <Sidebar.Logo
        href='#'
        img='logo512.png'
        imgAlt='logo'
        className='h-10 w-10 mb-16 '
      ></Sidebar.Logo>
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Link to='/'>
            <Sidebar.Item href='/' icon={ViewColumnsIcon}>
              Overview
            </Sidebar.Item>
          </Link>
          <Link to='/tasklist'>
            <Sidebar.Item icon={DocumentDuplicateIcon}>
              Project View
            </Sidebar.Item>
          </Link>
          <Link to='/collaborators'>
            <Sidebar.Item href='#' icon={UserGroupIcon}>
              Users
            </Sidebar.Item>
          </Link>
          <Link to='/profile'>
            <Sidebar.Item href='#' icon={UserIcon}>
              Profile
            </Sidebar.Item>
          </Link>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
};

export default MySidebar;
