import { Observable } from 'lib0/observable';
import * as Y from 'yjs';
import { fromUint8Array, toUint8Array } from 'js-base64';

import {
  handleIncomingRedirect,
  fetch,
  getDefaultSession,
  Session,
} from '@inrupt/solid-client-authn-browser';
import {
  buildThing,
  createSolidDataset,
  createThing,
  setThing,
  getStringNoLocale,
  setStringNoLocale,
  getThing,
  saveSolidDatasetAt,
  getSolidDataset,
  Url,
  universalAccess,
  getSolidDatasetWithAcl,
  getAgentAccessAll,
  AgentAccess,
  getUrlAll,
  getUrl,
  Thing,
} from '@inrupt/solid-client';
import { RDF, SCHEMA_INRUPT, DCTERMS } from '@inrupt/vocab-common-rdf';
import {
  randomWebRtcConnection,
  SolidDataset,
  WebRtcConnection,
} from './SolidDataset';

const POD_URL = 'https://truthless.inrupt.net';

export interface AccessModes {
  read: boolean;
  append: boolean;
  write: boolean;
  controlRead: boolean;
  controlWrite: boolean;
}

const writeAccess: AccessModes = {
  read: true,
  append: true,
  write: true,
  controlRead: false,
  controlWrite: false,
};

const readAccess: AccessModes = {
  read: true,
  append: false,
  write: false,
  controlRead: false,
  controlWrite: false,
};

export const login = async (
  oidcIssuer = 'https://inrupt.net',
  clientName = 'SyncedStore'
): Promise<Session> => {
  await handleIncomingRedirect({ restorePreviousSession: true });

  let session = getDefaultSession();

  if (!session.info.isLoggedIn) {
    await session.login({
      oidcIssuer: oidcIssuer,
      redirectUrl: window.location.href,
      clientName: clientName,
    });
  }

  return session;
};

const logAccessInfoAll = (agentAccess: AgentAccess | null, dataset: any) => {
  let resource = dataset.internal_resourceInfo.sourceIri;
  console.log(`For resource::: ${resource}`);

  if (agentAccess) {
    for (const [agent, access] of Object.entries(agentAccess)) {
      console.log(`${agent}'s Access:: ${JSON.stringify(access)}`);
    }
  } else {
    console.log('No access info found');
  }
};

const logAccessInfo = (agent: any, agentAccess: any, resource: any) => {
  console.log(`For resource::: ${resource}`);
  if (agentAccess === null) {
    console.log(`Could not load ${agent}'s access details.`);
  } else {
    console.log(`${agent}'s Access:: ${JSON.stringify(agentAccess)}`);
  }
};

export const getAccessInfoWAC = async (
  datasetWithAcl: any
): Promise<AgentAccess | null> => {
  let accessByAgent = getAgentAccessAll(datasetWithAcl);

  logAccessInfoAll(accessByAgent, datasetWithAcl);

  return accessByAgent;
};

export const getPublicAccessInfo = async (
  datasetUrl = `${POD_URL}/yjs/docs`
) => {
  universalAccess
    .getPublicAccess(
      datasetUrl, // Resource
      { fetch: fetch } // fetch function from authenticated session
    )
    .then((returnedAccess) => {
      if (returnedAccess === null) {
        console.log('Could not load access details for this Resource.');
      } else {
        console.log(
          'Returned Public Access:: ',
          JSON.stringify(returnedAccess)
        );
      }
    });
};

export const getAgentAccessInfo = async (
  resourceUrl: string,
  webid: string
): Promise<AccessModes | null> => {
  let agentAccess = universalAccess.getAgentAccess(
    resourceUrl, // resource
    webid, // agent
    { fetch: fetch } // fetch function from authenticated session
  );

  logAccessInfo(webid, agentAccess, resourceUrl);

  return agentAccess;
};

export const setPublicAccess = async (
  resourceUrl: string,
  access: AccessModes
): Promise<AccessModes | null> => {
  let publicAccess = await universalAccess.setPublicAccess(
    resourceUrl, // Resource
    access, // Access
    { fetch: fetch } // fetch function from authenticated session
  );

  if (publicAccess === null) {
    console.log('Could not load access details for this Resource.');
  } else {
    console.log('Returned Public Access:: ', JSON.stringify(publicAccess));
  }

  return access;
};

export const setAgentAccess = async (
  resourceUrl: string,
  webId: string,
  access: AccessModes
) => {
  universalAccess
    .setAgentAccess(
      resourceUrl, // Resource
      webId, // Agent
      access, // Access
      { fetch: fetch } // fetch function from authenticated session
    )
    .then((returnedAccess) => {
      if (returnedAccess === null) {
        console.log('Could not load access details for this Resource.');
      } else {
        console.log('Returned Agent Access:: ', JSON.stringify(returnedAccess));
      }
    });
};

/**
 * Subscribe to a Solid resource via WebSocket.
 * Currently only supports NSS implementations of pods.
 *
 * @param resourceUrl
 * @param socketUrl
 * @returns A websocket connection to the resource
 */
const openSolidWebSocket = (
  resourceUrl: string,
  socketUrl: string = 'wss://inrupt.net/'
): WebSocket | null => {
  try {
    let websocket = new WebSocket(socketUrl, ['solid-0.1']);

    websocket.onopen = function () {
      this.send('sub ' + resourceUrl);
    };

    return websocket;
  } catch (e) {
    console.log('Could not connect to websocket', e);
  }

  return null;
};

export class SolidPersistence extends Observable<string> {
  public name: string;
  public doc: Y.Doc;
  public loggedIn: boolean;
  public session: Session;
  public dataset: SolidDataset | null;
  public hasCreatorAccess: boolean;
  public websocket: any;

  private isUpdating: boolean;
  private furtherUpdates: any[];
  private lastFetched: Date | null;
  private requiresFetch: boolean;
  private isFetching: boolean;

  private constructor(
    name: string,
    doc: Y.Doc,
    session: Session,
    dataset: SolidDataset | null,
    hasCreatorAccess: boolean,
    websocket: any
  ) {
    super();

    this.name = name;
    this.doc = doc;

    this.dataset = dataset;

    this.session = session;
    this.loggedIn = this.session.info.isLoggedIn;
    this.hasCreatorAccess = hasCreatorAccess;

    this.isUpdating = false;
    this.furtherUpdates = [];
    this.lastFetched = null;
    this.isFetching = false;
    this.requiresFetch = false;

    this.websocket = websocket;

    // Currently also fetches when an update comes from this provider
    this.websocket.onmessage = async (msg: any) => {
      if (msg.data && msg.data.slice(0, 3) === 'pub') {
        console.log('[Notification] Resource updated', msg);
        if (this.isUpdating || this.isFetching) {
          console.log(
            '[Notification] Update or fetch in progress, queueing fetch'
          );
          this.requiresFetch = true;
        } else {
          console.log('[Notification] Fetching pod');
          await this.fetchPod();
        }

        while (this.requiresFetch) {
          this.requiresFetch = false;
          await this.fetchPod();
        }
      }
    };

    this.doc.on('update', (update, origin) => {
      console.log(
        '[YDoc] Origin of update: ',
        origin === this ? 'local' : 'remote'
      );
      if (origin !== this) {
        if (this.isUpdating || this.isFetching) {
          console.log('Update or fetch in progress, queueing update');
          this.furtherUpdates.push(update);
        } else {
          this.isUpdating = true;
          this.emit('update', [update, origin]);
        }
      }
    });

    this.on('update', async (update: Uint8Array, origin: any) => {
      console.log('[Solid] Update received from ', origin);
      await this.update([update]);
      console.log('[Solid] Update complete');

      // if there are more updates in the meantime, update to the latest state
      while (this.furtherUpdates.length > 0) {
        console.log(
          '[Solid] applying ' + this.furtherUpdates.length + ' further updates'
        );
        await this.update(this.furtherUpdates.splice(0));
      }

      // if there are more notifications in the meantime, fetch the latest pod state
      if (this.requiresFetch) {
        console.log('[Solid] Additional fetching required');
        await this.fetchPod();
      }

      this.isUpdating = false;
    });

    this.emit('created', [this]);
  }

  public static async create(
    name: string,
    doc: Y.Doc,
    autoLogin = true,
    resourceUrl = `${POD_URL}/yjs/docs`
  ): Promise<SolidPersistence> {
    let session, hasCreatorAccess;

    hasCreatorAccess = false;

    // LOGIN
    if (autoLogin) {
      session = await login();
    } else {
      await handleIncomingRedirect();
      session = getDefaultSession();
    }

    // NOT LOGGED IN
    if (!session.info.isLoggedIn || !session.info.webId) {
      console.log('Not logged in');
      return new SolidPersistence(name, doc, session, null, false, null);
    }

    // LOAD DATASET
    let dataset = await SolidDataset.create(
      name,
      resourceUrl,
      session.info.webId
    );
    if (dataset.value.length > 0) Y.applyUpdate(doc, dataset.value, this);
    await dataset.update(Y.encodeStateAsUpdate(doc));

    // CONNECT TO NOTIFICATIONS
    let websocket = openSolidWebSocket(resourceUrl, 'wss://inrupt.net/');

    return new SolidPersistence(
      name,
      doc,
      session,
      dataset,
      hasCreatorAccess,
      websocket
    );
  }

  public async update(updates: Uint8Array[]) {
    if (this.loggedIn) {
      await this.fetchPod(); // dataset and thing need to be fetched before an update (avoid 409)

      Y.transact(
        this.doc,
        () => {
          updates.forEach((update) => {
            Y.applyUpdate(this.doc, update);
          });
        },
        this,
        false
      );

      await this.dataset?.update(Y.encodeStateAsUpdate(this.doc));
    } else {
      console.log('Cannot sync update - not logged in');
    }
  }

  public async fetchPod() {
    this.isFetching = true;

    if (this.loggedIn) {
      this.requiresFetch = false;
      let value = await this.dataset?.fetch();
      if (value) Y.applyUpdate(this.doc, value, this);
      console.log('Fetched from pod');
    } else {
      console.log('Cannot fetch - not logged in');
    }

    this.isFetching = false;
  }

  public async setAgentAccess(
    webId: string,
    access: AccessModes = writeAccess
  ) {
    if (this.loggedIn && this.dataset) {
      await setAgentAccess(this.dataset.url, webId, access);
    } else {
      console.log('Cannot set access - not logged in');
    }
  }

  public async setPublicAccess(access: AccessModes = readAccess) {
    if (this.loggedIn && this.dataset) {
      await setPublicAccess(this.dataset.url, access);
    } else {
      console.log('Cannot set access - not logged in');
    }
  }

  public getWebRtcConnection(): WebRtcConnection | null {
    if (this.loggedIn && this.dataset) {
      // try to get a connection from the pod
      let connection = this.dataset.getWebRtcConnection();

      if (!connection) {
        // if there is no connection, create one
        connection = randomWebRtcConnection();
        // and save it to the pod asynchroniously
        this.dataset.addWebRtcConnection(connection);
      }

      return connection;
    } else {
      console.log('Cannot get WebRTC connection - not logged in');
      return null;
    }
  }
}
