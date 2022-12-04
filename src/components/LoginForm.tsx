import { Button, Card, Label, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { login } from '../store';

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

          <Button
            gradientDuoTone='pinkToOrange'
            onClick={() => login(provider)}
          >
            Log in
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;
