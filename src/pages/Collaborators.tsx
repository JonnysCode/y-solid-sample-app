import React from 'react';

import { Button, Card, TextInput } from 'flowbite-react';
import { Collaborator } from '../store/y-solid/SolidPersistance';
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
        <div className='card w-[400px] p-0 divide-y-2 divide-black overflow-hidden'>
          <div className='h-7 bg-primary' />

          <div className='p-4'>
            <div className='mb-4 mt-2 flex items-center justify-center'>
              <h5 className='px-3 py-0.5 text-xl font-bold text-black bg-accent shadow-full_sm'>
                Collaborators
              </h5>
            </div>
            <ul className='divide-y divide-black/25 '>
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

          <div className='w-full my-2 p-4 flex flex-col justify-between'>
            <div className='mb-6 mt-2 flex items-center justify-center'>
              <h5 className='px-3 py-0.5 text-xl font-bold text-black bg-accent shadow-full_sm'>
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
                  className='border-main'
                />
              </div>
              <div className='flex flex-row gap-4 w-full justify-between'>
                <div className=''>
                  <div
                    className='btn btn-secondary'
                    onClick={() => {
                      addWriteAccess(webId);
                      setWebId('');
                    }}
                  >
                    Add Write Access
                  </div>
                </div>
                <div className=''>
                  <div
                    className='btn btn-secondary'
                    onClick={() => {
                      addReadAccess(webId);
                      setWebId('');
                    }}
                  >
                    Add Read Access
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

interface UserCardProps {
  collaborator: Collaborator;
}

const UserItem = (props: UserCardProps) => {
  return (
    <li className='py-3'>
      <div className='flex items-center space-x-4'>
        <div className='shrink-0'>
          <img
            className='h-8 w-8 rounded-full border-main shadow-full_sm'
            src='https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png'
            alt='User'
          />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-bold text-black'>
            {props.collaborator.webId}
          </p>
          <p className='truncate text-sm font-bold text-secondary'>
            {props.collaborator.isCreator ? 'Creator' : 'Contributor'}
          </p>
        </div>
      </div>
    </li>
  );
};

export default Collaborators;
