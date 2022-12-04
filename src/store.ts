import { getYjsValue, syncedStore, getYjsDoc } from '@syncedstore/core';
import * as Y from 'yjs';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import {
  SolidPersistence,
  login as solidLogin,
  getPublicAccessInfo,
} from './solid';

export type Todo = {
  title: string;
  completed: boolean;
};

const fileName = 'todos3';

export const globalStore = syncedStore({ todos: [] as Todo[] });
const doc = getYjsDoc(globalStore);

const indexeddbPersistence = new IndexeddbPersistence(fileName, doc);

indexeddbPersistence.on('synced', () => {
  console.log('content from the database is loaded');
});

const solidPersistence = await SolidPersistence.create(fileName, doc, false);

export const solid = () => {
  console.log('solid', solidPersistence);
};

export const login = async (oidcIssuer: string) => {
  await solidLogin(oidcIssuer);
  console.log('awaited login');
};

export const getCollaborators = async () => {
  return solidPersistence.getCollaborators();
};

export const sessionInfo = () => {
  console.log('Session info: ', solidPersistence.session.info);
};

export const datasetInfo = () => {
  console.log('Dataset info: ', solidPersistence.dataset);
  console.log('Doc info: ', solidPersistence.doc.toJSON());
};

export const access = async () => {
  //await setAgentAccess();
  getPublicAccessInfo();
  //getAgentAccessInfo();
  //await setAccessWAC();
  //accessControl();
};

let webRtcProvider;

export const addWebRtc = () => {
  const connection = solidPersistence.getWebRtcConnection();
  if (connection) {
    /*
    webRtcProvider = new WebrtcProvider(connection.room, doc, {
      signaling: null,
      password: connection.password,
      awareness: new awarenessProtocol.Awareness(doc),
      maxConns: null,
      filterBcConns: null,
      peerOpts: null,
    });
    */
    webRtcProvider = new WebrtcProvider(connection.room, doc);

    console.log('WebRTC connection added', connection);

    webRtcProvider.on('synced', (event: any) => {
      console.log('synced', event.status);
    });

    webRtcProvider.on('peers', (event: any) => {
      console.log('peers', event.status);
    });
  }
};
