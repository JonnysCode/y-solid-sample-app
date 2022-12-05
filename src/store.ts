import { syncedStore, getYjsDoc, SyncedXml } from '@syncedstore/core';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import {
  SolidPersistence,
  login as solidLogin,
  getPublicAccessInfo,
} from './solid';

export type Todos = {
  title: string;
  completed: boolean;
};

export type Task = {
  title: string;
  fragment: SyncedXml;
  completed: boolean;
};

export const emptyTask = (): Task => {
  return {
    title: '',
    fragment: new SyncedXml(),
    completed: false,
  };
};

export type Project = {
  title: string;
  tasks: Task[];
};

const fileName = 'projects3';

export const globalStore = syncedStore({
  projects: [] as Project[],
  todos: [] as Todos[],
});

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

export const getCollaborators = () => {
  return solidPersistence.getCollaborators();
};

export const addWriteAccess = async (webId: string) => {
  await solidPersistence.addWriteAccess(webId);
};

export const addReadAccess = async (webId: string) => {
  await solidPersistence.addWriteAccess(webId);
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

const connection = solidPersistence.getWebRtcConnection();

export const webrtcProvider = new WebrtcProvider(connection.room, doc);

export const webrtcDisconnect = () => webrtcProvider.disconnect();
export const webrtcConnect = () => webrtcProvider.connect();

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
    let webrtc = new WebrtcProvider(connection.room, doc);

    console.log('WebRTC connection added', connection);

    webrtc.on('synced', (event: any) => {
      console.log('synced', event.status);
    });

    webrtc.on('peers', (event: any) => {
      console.log('peers', event.status);
    });
  }
};
