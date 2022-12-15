import {
  useSession,
  CombinedDataProvider,
  LogoutButton,
  Text,
} from '@inrupt/solid-ui-react';
import { Button, Card } from 'flowbite-react';
import { FOAF } from '@inrupt/lit-generated-vocab-common';

const Profile = () => {
  return (
    <div className='h-full flex flex-col items-center justify-center'>
      <ProfileCard />
    </div>
  );
};

const ProfileCard = () => {
  const { session } = useSession();
  const { webId } = session.info as any;

  return (
    <div className='max-w-sm'>
      <CombinedDataProvider datasetUrl={webId} thingUrl={webId}>
        <div className='card w-[400px] p-0 divide-y-2 divide-black overflow-hidden'>
          <div className='h-7 bg-primary' />

          <div className='flex flex-col items-center p-4 gap-4'>
            <div className='w-96' />
            <img
              className='mb-3 p-1 h-24 w-24 rounded-full shadow-full_sm border-main bg-neutral-dark'
              src='assets/images/fifties.png'
              alt='Profile'
            />
            <h5 className='mb-1 px-3 text-xl font-bold text-black bg-accent shadow-full_sm'>
              <Text property={FOAF.name.iri.value} edit={false} autosave />
            </h5>
            <div className='text-sm text-black'>
              <span className='font-bold'>webid:</span> {session.info.webId}
            </div>
            <LogoutButton
              onError={console.error}
              onLogout={() => window.location.reload()}
            >
              <div className='btn btn-secondary'>Log out</div>
            </LogoutButton>
          </div>
        </div>
      </CombinedDataProvider>
    </div>
  );
};

export default Profile;
