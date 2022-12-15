import { useEffect, useState } from 'react';
import { Switch } from '@headlessui/react';
import { webrtcConnect, webrtcDisconnect } from '../store/store';

const Toggle = ({ props }: any) => {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    enabled ? webrtcConnect() : webrtcDisconnect();
  }, [enabled]);

  return (
    <div className=' flex flex-row gap-2 justify-center items-center'>
      <h1 className='text-base font-bold text-black align-middle'>WebRTC</h1>
      <div className='inline-flex items-center rounded-full border-2 border-black mb-1 shadow-full_sm overflow-hidden'>
        <Switch
          checked={enabled}
          onChange={setEnabled}
          className={`${
            enabled ? 'bg-accent' : 'bg-neutral'
          } relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span className='sr-only'>Enable WebRTC connection</span>
          <span
            className={`${
              enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-black transition`}
          />
        </Switch>
      </div>
    </div>
  );
};

export default Toggle;
