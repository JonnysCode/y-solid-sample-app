import React from 'react';

import { Button, Card, TextInput } from 'flowbite-react';
import { Collaborator } from '../store/solid';
import {
  addReadAccess,
  addWriteAccess,
  getCollaborators,
} from '../store/store';

const Collaborators = () => {
  const [webId, setWebId] = React.useState('');

  return (
    <div className='h-full flex flex-col items-center justify-center gap-4'>
      <div className='max-w-sm'>
        <Card>
          <div className='mb-4 flex items-center justify-between'>
            <h5 className='text-xl font-bold leading-none text-gray-900 dark:text-white'>
              Collaborators
            </h5>
          </div>
          <div className='flow-root'>
            <ul className='divide-y divide-gray-200 dark:divide-gray-700'>
              {getCollaborators().map((collaborator, i) => {
                return (
                  <UserItem
                    collaborator={collaborator}
                    key={collaborator.webId + i}
                  />
                );
              })}
            </ul>
          </div>
          <div className='mt-4 flex items-center justify-between'>
            <h5 className='text-xl font-bold leading-none text-gray-900 dark:text-white'>
              Access Control
            </h5>
          </div>
          <form className='flex flex-col gap-4'>
            <div>
              <TextInput
                id='provider'
                type='text'
                value={webId}
                placeholder='WebId'
                onChange={(e) => setWebId(e.target.value)}
                required={true}
              />
            </div>
            <div className='flex flex-row gap-4 w-full items-center justify-between'>
              <div className=''>
                <Button
                  gradientDuoTone='purpleToBlue'
                  outline={true}
                  onClick={() => {
                    addWriteAccess(webId);
                    setWebId('');
                  }}
                >
                  Add Write Access
                </Button>
              </div>
              <div className=''>
                <Button
                  gradientDuoTone='purpleToBlue'
                  outline={true}
                  onClick={() => {
                    addReadAccess(webId);
                    setWebId('');
                  }}
                >
                  Add Read Access
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

interface UserCardProps {
  collaborator: Collaborator;
}

const UserItem = (props: UserCardProps) => {
  return (
    <li className='py-3 sm:py-4'>
      <div className='flex items-center space-x-4'>
        <div className='shrink-0'>
          <img
            className='h-8 w-8 rounded-full'
            src='https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png'
            alt='User'
          />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-bold text-zinc-900 dark:text-white'>
            {props.collaborator.webId}
          </p>
          <p className='truncate text-sm text-zinc-500 dark:text-zinc-400'>
            {props.collaborator.isCreator ? 'Creator' : 'Contributor'}
          </p>
        </div>
      </div>
    </li>
  );
};

export default Collaborators;
