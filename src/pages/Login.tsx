import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Label, TextInput } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { login } from '../store/store';
import { useSession } from '@inrupt/solid-ui-react';

const Login = () => {
  const { session } = useSession();
  const [provider, setProvider] = useState('https://inrupt.net/');

  const navigate = useNavigate();
  const { state } = useLocation();

  const handleLogin = (provider: any) => {
    login(provider);
  };

  useEffect(() => {
    if (session.info.isLoggedIn) navigate(state?.path || '/');
  }, [session, state?.path, navigate]);

  return (
    <div className='h-screen w-screen bg-main'>
      <div className='h-full w-full flex flex-col items-center justify-center bg-hexagon2'>
        <img
          className='h-28 m-[-56px] z-40'
          src='./assets/images/solid-logo.svg'
          alt='logo'
        />
        <div className='max-w-sm'>
          <Card className='w-80'>
            <h5 className='mb-2 mt-10 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white'>
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
              <Button
                gradientDuoTone='purpleToBlue'
                onClick={() => handleLogin(provider)}
              >
                Log in
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
