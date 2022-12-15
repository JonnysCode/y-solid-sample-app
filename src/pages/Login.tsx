import { useLocation, useNavigate } from 'react-router-dom';
import { Label, TextInput } from 'flowbite-react';
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
      <div className='absolute top-0 left-0 p-4'>
        <div className='flex flex-row items-center justify-center gap-1'>
          <img src='logo512.png' alt='logo' className='h-14 w-14' />
          <h1 className='mt-1 text-3xl text-black font-bold'>
            Project Planner
          </h1>
        </div>
      </div>

      <div className='h-full w-full flex flex-col items-center justify-center'>
        <div className='max-w-sm'>
          <div className='w-80 card p-0 divide-y-2 divide-black overflow-hidden'>
            <div className='h-7 flex items-center bg-primary'>
              <div className='mx-2 text-black font-bold '>SOLID</div>
            </div>

            <div className='w-full p-4 flex flex-col'>
              <div className='mb-6 mt-2 flex items-center justify-center'>
                <h5 className='px-3 py-0.5 text-3xl font-bold text-center text-black bg-accent shadow-full_sm'>
                  Login
                </h5>
              </div>

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
                    className='border-main'
                  />
                </div>
                <div
                  onClick={() => handleLogin(provider)}
                  className='btn btn-secondary'
                >
                  Log in
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
