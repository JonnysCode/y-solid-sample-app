import {
  login,
  sessionInfo,
  loadDataset,
  datasetInfo,
  saveDataset,
  addThingToDataset,
  solid,
} from '../store';

export default function Solid() {
  return (
    <div className='flex flex-col gap-4 justify-center items-center'>
      <h1 className='text-lg font-semibold'>Solid</h1>
      <div className='flex flex-row gap-2'>
        <button className='btn-primary' onClick={() => login()}>
          Login
        </button>
        <button className='btn-primary' onClick={() => sessionInfo()}>
          Session Info
        </button>
        <button className='btn-primary' onClick={() => loadDataset()}>
          Load Dataset
        </button>
        <button className='btn-primary' onClick={() => datasetInfo()}>
          Dataset Info
        </button>
        <button className='btn-primary' onClick={() => saveDataset()}>
          Save Dataset
        </button>
        <button className='btn-primary' onClick={() => addThingToDataset()}>
          Add Thing
        </button>
        <button className='btn-primary' onClick={() => solid()}>
          Solid
        </button>
      </div>
    </div>
  );
}
