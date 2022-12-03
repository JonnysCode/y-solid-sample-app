import { useSyncedStore } from '@syncedstore/react';
import React, { useState } from 'react';
import { globalStore } from './store';
import TodoApp from './components/TodoApp';
import Layout from './components/Layout';

function App() {
  const store = useSyncedStore(globalStore);

  return (
    <div className='w-screen h-screen flex flex-col items-center justify-center'>
      <Layout>
        <TodoApp />
      </Layout>
    </div>
  );
}

export default App;
