import {
  login,
  sessionInfo,
  datasetInfo,
  solid,
  access,
  addWebRtc,
} from '../store';

export default function Solid() {
  return (
    <div className='flex flex-col gap-4 justify-center items-center'>
      <h1 className='text-xl font-semibold text-primary-700'>
        Solid Debugging
      </h1>
      <div className='flex flex-row gap-2'>
        <button className='btn-primary' onClick={() => login()}>
          Login
        </button>
        <button className='btn-primary' onClick={() => sessionInfo()}>
          Session Info
        </button>
        <button className='btn-primary' onClick={() => datasetInfo()}>
          Dataset Info
        </button>
        <button className='btn-primary' onClick={() => solid()}>
          Solid
        </button>
        <button className='btn-primary' onClick={() => access()}>
          Access
        </button>
        <button className='btn-primary' onClick={() => addWebRtc()}>
          Add WebRTC
        </button>
      </div>
    </div>
  );
}
