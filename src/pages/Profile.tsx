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

const Profile = () => {
  const { session, sessionRequestInProgress } = useSession();

  return (
    <div className='h-full flex flex-col items-center justify-center'>
      {!session.info.isLoggedIn ? <LoginForm /> : <ProfileCard />}
    </div>
  );
};

const LoginForm = () => {
  const [provider, setProvider] = useState('https://inrupt.net/');

  return (
    <div className='max-w-sm'>
      <Card imgSrc='../assets/images/solid.png'>
        <h5 className='text-2xl font-bold tracking-tight text-zinc-900 dark:text-white'>
          SOLID Login
        </h5>
        <form className='flex flex-col gap-4'>
          <div id='select'>
            <div className='mb-2 block'>
              <Label htmlFor='provider' value='Pod Provider' />
            </div>
            <TextInput
              id='provider'
              type='text'
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              required={true}
            />
          </div>

          <Button onClick={() => login(provider)}>Log in</Button>
        </form>
      </Card>
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
              <Button>Log out</Button>
            </LogoutButton>
          </div>
        </Card>
      </CombinedDataProvider>
    </div>
  );
};

export default Profile;
