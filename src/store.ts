import { getYjsValue, syncedStore, getYjsDoc } from '@syncedstore/core';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import {
  SolidPersistence,
  login as solidLogin,
  accessControl,
  setAccess,
} from './solid';

export type Todo = {
  title: string;
  completed: boolean;
};

const fileName = 'todos1';

export const globalStore = syncedStore({ todos: [] as Todo[] });
const doc = getYjsDoc(globalStore);

//new WebrtcProvider('id', getYjsValue(globalStore) as any); // sync via webrtc

const indexeddbPersistence = new IndexeddbPersistence(fileName, doc);

indexeddbPersistence.on('synced', () => {
  console.log('content from the database is loaded');
});

const solidPersistence = await SolidPersistence.create(fileName, doc);

export const solid = () => {
  console.log('solid', solidPersistence);
};

export const login = async () => {
  await solidLogin();
  console.log('awaited login');
};

export const sessionInfo = () => {
  console.log('Session info: ', solidPersistence.session.info);
};

export const datasetInfo = () => {
  console.log('Dataset info: ', solidPersistence.dataset);
  console.log('Doc info: ', solidPersistence.doc.toJSON());
};

export const access = async () => {
  await setAccess();
  accessControl();
};
