import {
  useSession,
  CombinedDataProvider,
  LogoutButton,
  Image,
  Text,
} from '@inrupt/solid-ui-react';
import {
  Label,
  TextInput,
  Checkbox,
  Button,
  Select,
  Card,
} from 'flowbite-react';
import { useState } from 'react';
import { FOAF, VCARD } from '@inrupt/lit-generated-vocab-common';

import { login } from '../store';
import LoginForm from '../components/LoginForm';

const Profile = () => {
  const { session, sessionRequestInProgress } = useSession();

  return (
    <div className='h-full flex flex-col items-center justify-center'>
      {!session.info.isLoggedIn ? <LoginForm /> : <ProfileCard />}
    </div>
  );
};

const ProfileCard = () => {
  const { session } = useSession();
  const { webId } = session.info as any;

  return (
    <div className='max-w-sm'>
      <CombinedDataProvider datasetUrl={webId} thingUrl={webId}>
        <Card className='justify'>
          <div className='flex flex-col items-center gap-4'>
            <div className='w-96' />
            <img
              className='mb-3 h-24 w-24 rounded-full shadow-lg'
              src='https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png'
              alt='Profile'
            />
            <h5 className='mb-1 text-xl font-medium text-gray-900 dark:text-white'>
              <Text property={FOAF.name.iri.value} edit={false} autosave />
            </h5>
            <div className='text-sm text-gray-500 dark:text-gray-400'>
              <span className='font-bold'>webid:</span> {session.info.webId}
            </div>
            <LogoutButton
              onError={console.error}
              onLogout={() => window.location.reload()}
            >
              <Button outline={true} gradientDuoTone='pinkToOrange'>
                Log out
              </Button>
            </LogoutButton>
          </div>
        </Card>
      </CombinedDataProvider>
    </div>
  );
};

export default Profile;
