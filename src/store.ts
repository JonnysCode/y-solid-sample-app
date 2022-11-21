import { getYjsValue, syncedStore } from '@syncedstore/core';
import { WebrtcProvider } from 'y-webrtc';
import { SolidPersistence, login as solidLogin } from './solid';

console.log('store.ts');

export type Todo = {
  title: string;
  completed: boolean;
};

export const globalStore = syncedStore({ todos: [] as Todo[] });
new WebrtcProvider('id', getYjsValue(globalStore) as any); // sync via webrtc

const solidPersistence = await SolidPersistence.create(
  'todos',
  getYjsValue(globalStore) as any
);

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

export const loadDataset = async () => {
  await solidPersistence.loadDataset();
  console.log('awaited loadDataset');
};

export const datasetInfo = () => {
  console.log('Dataset info: ', solidPersistence.dataset);
};

export const saveDataset = async () => {
  await solidPersistence.newReadingList();
  console.log('awaited saveDataset');
};

export const addThingToDataset = async () => {
  await solidPersistence.addThingToDataset();
  console.log('awaited addThingToDataset');
};
