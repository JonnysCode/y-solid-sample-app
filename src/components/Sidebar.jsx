import {
  DocumentDuplicateIcon,
  ViewColumnsIcon,
  UserIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

import { BiHomeAlt, BiUser, BiWorld } from 'react-icons/bi';

import { Sidebar } from 'flowbite-react';
import { Link } from 'react-router-dom';

const MySidebar = (props) => {
  return (
    <div className={props.className}>
      <div className='flex flex-col w-16 h-full bg-neutral items-center'>
        <div className='flex-0 mt-2'>
          <img src='logo512.png' alt='logo' className='h-12 w-12' />
        </div>

        <div className='flex grow flex-col items-center justify-center gap-2'>
          <div className='m-3 border-main bg-secondary hover:bg-secondary-dark shadow-full_sm'>
            <Link to='/'>
              <BiHomeAlt className='h-8 w-8 text-black' />
            </Link>
          </div>
          <div className='m-3 border-main bg-accent hover:bg-accent-dark shadow-full_sm'>
            <Link to='/collaborators'>
              <BiWorld className='h-8 w-8 text-black' />
            </Link>
          </div>
          <div className='m-3 border-main bg-primary hover:bg-primary-dark shadow-full_sm'>
            <Link to='/profile'>
              <BiUser className='h-8 w-8 text-black' />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const Item = (props) => {
  return <div className=''></div>;
};

const MySidebar2 = (props) => {
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
            <Sidebar.Item as='div' icon={ViewColumnsIcon}>
              Overview
            </Sidebar.Item>
          </Link>
          <Link to='/tasklist'>
            <Sidebar.Item as='div' icon={DocumentDuplicateIcon}>
              Project View
            </Sidebar.Item>
          </Link>
          <Link to='/collaborators'>
            <Sidebar.Item as='div' icon={UserGroupIcon}>
              Users
            </Sidebar.Item>
          </Link>
          <Link to='/profile'>
            <Sidebar.Item as='div' icon={UserIcon}>
              Profile
            </Sidebar.Item>
          </Link>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
};

export default MySidebar;
