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

const POD_URL = 'https://truthless.inrupt.net';

export interface AccessModes {
  read: boolean;
  append: boolean;
  write: boolean;
  controlRead: boolean;
  controlWrite: boolean;
}

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

const loadDataset = async (datasetUrl: string | Url, withAcl = false) => {
  let dataset;
  try {
    if (withAcl) {
      dataset = await getSolidDatasetWithAcl(datasetUrl, {
        fetch: fetch,
      });
    } else {
      dataset = await getSolidDataset(
        datasetUrl,
        { fetch: fetch } // fetch function from authenticated session
      );
    }
  } catch (error) {
    console.log('Error loading dataset: ', error);
  }

  return dataset;
};

const saveDataset = async (dataset: any, datasetUrl: string | Url) => {
  try {
    await saveSolidDatasetAt(
      datasetUrl,
      dataset,
      { fetch: fetch } // fetch function from authenticated session
    );
  } catch (error) {
    console.log('Error saving dataset: ', error);
  }
};

const newYDocThing = (name: string, value: Uint8Array, webId: string) => {
  const thing = buildThing(createThing({ name: name }))
    .addStringNoLocale(SCHEMA_INRUPT.name, 'SyncedStore Y.Doc')
    .addUrl(RDF.type, 'https://schema.org/DigitalDocument')
    .addUrl(RDF.type, 'https://docs.yjs.dev/api/y.doc')
    .addUrl(DCTERMS.creator, webId)
    .addStringNoLocale(SCHEMA_INRUPT.value, fromUint8Array(value))
    .build();

  return thing;
};

const updateYDocThing = (thing: Thing, value: Uint8Array) => {
  return setStringNoLocale(thing, SCHEMA_INRUPT.value, fromUint8Array(value));
};

const isContributor = (thing: Thing, webId: string) => {
  const contributors = getUrlAll(thing, DCTERMS.contributor);
  console.log('contributors', contributors);
  return contributors.includes(webId);
};

const isCreator = (thing: Thing, webId: string) => {
  const creator = getUrl(thing, DCTERMS.creator);
  console.log('creator', creator);
  return creator === webId;
};

const addContributorToThing = (thing: Thing, webId: string) => {
  return setStringNoLocale(thing, DCTERMS.contributor, webId);
};

const getYDocThing = (dataset: any, datasetUrl: string, name: string) => {
  return getThing(dataset, datasetUrl + '#' + name);
};

const getYDocValue = (thing: Thing) => {
  const value = getStringNoLocale(thing, SCHEMA_INRUPT.value);

  return value ? toUint8Array(value) : null;
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
  access: AccessModes = {
    read: true,
    append: false,
    write: false,
    controlRead: false,
    controlWrite: false,
  }
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
  datasetUrl = `${POD_URL}/yjs/docs`,
  webId = 'https://imp.solidcommunity.net/profile/card#me',
  access: AccessModes = {
    read: true,
    append: true,
    write: true,
    controlRead: false,
    controlWrite: false,
  }
) => {
  universalAccess
    .setAgentAccess(
      datasetUrl, // Resource
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

class SolidDataset {
  public name: string;
  public url: string;
  public resource: any;
  public thing: any;
  public value: Uint8Array;

  private constructor(
    name: string,
    url: string,
    resource: any,
    thing: any,
    value: Uint8Array
  ) {
    this.name = name;
    this.url = url;
    this.resource = resource;
    this.thing = thing;
    this.value = value;
  }

  public static async create(name: string, url: string, webId: string) {
    let dataset, value, thing;

    dataset = await loadDataset(url, false);

    if (dataset) {
      thing = getYDocThing(dataset, url, name);
      if (thing) {
        value = getYDocValue(thing);
      }
    } else {
      dataset = createSolidDataset();
    }

    if (!value) {
      value = new Uint8Array();
      thing = newYDocThing(name, value, webId);
      dataset = setThing(dataset, thing);
      await saveDataset(dataset, url);
    }

    if (thing && !isContributor(thing, webId) && !isCreator(thing, webId)) {
      thing = addContributorToThing(thing, webId);
      dataset = setThing(dataset, thing);
      await saveDataset(dataset, url);
    }

    return new SolidDataset(name, url, dataset, thing, value);
  }

  public fetch = async (): Promise<Uint8Array | null> => {
    this.resource = await loadDataset(this.url, false);
    this.thing = getYDocThing(this.resource, this.url, this.name);

    let value = getYDocValue(this.thing);
    if (value) {
      this.value = value;
    }

    return value;
  };

  public update = async (value: Uint8Array): Promise<void> => {
    this.thing = updateYDocThing(this.thing, value);
    this.resource = setThing(this.resource, this.thing);
    await this.save();
  };

  public save = async (): Promise<void> => {
    await saveDataset(this.resource, this.url);
  };
}

enum UpdateType {
  YDocUpdate,
  YDocSync,
  SolidNotification,
}

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
        console.log('[Notification] Resource updated', msg.data);
        if (this.isUpdating || this.isFetching) {
          console.log('Update or fetch in progress, queueing fetch');
          this.requiresFetch = true;
        } else {
          await this.fetchPod();
        }

        while (this.requiresFetch) {
          this.requiresFetch = false;
          await this.fetchPod();
        }
      }
    };

    this.doc.on('update', (update, origin) => {
      if (origin !== this) {
        if (this.isUpdating || this.isFetching) {
          console.log('Update or fetch in progress, queueing update');
          this.furtherUpdates.push(update);
        } else {
          this.isUpdating = true;
          this.emit('update', [update]);
        }
      }
    });

    this.on('update', async (update: Uint8Array) => {
      await this.update([update]);

      // if there are more updates in the meantime, update to the latest state
      while (this.furtherUpdates.length > 0) {
        console.log(
          '[update] applying ' + this.furtherUpdates.length + ' further updates'
        );
        await this.update(this.furtherUpdates.splice(0));
      }

      // if there are more notifications in the meantime, fetch the latest pod state
      if (this.requiresFetch) {
        console.log('[update] Additional fetching required');
        await this.fetchPod();
      }

      this.isUpdating = false;
    });
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
    access: AccessModes = {
      read: true,
      append: true,
      write: true,
      controlRead: false,
      controlWrite: false,
    }
  ) {
    if (this.loggedIn) {
      await setAgentAccess(this.dataset?.url, webId, access);
    } else {
      console.log('Cannot set access - not logged in');
    }
  }
}
