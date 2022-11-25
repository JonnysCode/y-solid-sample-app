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
  addUrl,
  addStringNoLocale,
  buildThing,
  createSolidDataset,
  createThing,
  setThing,
  getThingAll,
  getStringNoLocale,
  setStringNoLocale,
  getThing,
  saveSolidDatasetAt,
  getSolidDataset,
  Url,
  universalAccess,
  getSolidDatasetWithAcl,
  getAgentAccessAll,
  hasResourceAcl,
  hasFallbackAcl,
  hasAccessibleAcl,
  createAcl,
  createAclFromFallbackAcl,
  getResourceAcl,
  setAgentResourceAccess,
  saveAclFor,
  Access,
  AgentAccess,
} from '@inrupt/solid-client';
import { RDF, SCHEMA_INRUPT, AS } from '@inrupt/vocab-common-rdf';

const POD_URL = 'https://truthless.inrupt.net';

export const login = async (
  oidcIssuer = 'https://inrupt.net/',
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

const createYDocThing = (name: string, doc: Y.Doc) => {
  const thing = buildThing(createThing({ name: name }))
    .addStringNoLocale(SCHEMA_INRUPT.name, 'SyncedStore Y.Doc')
    .addUrl(RDF.type, 'https://schema.org/DigitalDocument')
    .addUrl(RDF.type, 'https://docs.yjs.dev/api/y.doc')
    .addStringNoLocale(
      SCHEMA_INRUPT.value,
      fromUint8Array(Y.encodeStateAsUpdate(doc))
    )
    .build();

  return thing;
};

const updateYDocThing = (thing: any, doc: Y.Doc) => {
  thing = setStringNoLocale(
    thing,
    SCHEMA_INRUPT.value,
    fromUint8Array(Y.encodeStateAsUpdate(doc))
  );

  return thing;
};

const getYDocThing = (dataset: any, datasetUrl: string, name: string) => {
  return getThing(dataset, datasetUrl + '#' + name);
};

const getYDocValue = (thing: any, name: string) => {
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
  datasetUrl = `${POD_URL}/yjs/docs`,
  webid = 'https://imp.inrupt.net/profile/card#me'
) => {
  universalAccess
    .getAgentAccess(
      datasetUrl, // resource
      webid, // agent
      { fetch: fetch } // fetch function from authenticated session
    )
    .then((agentAccess) => {
      logAccessInfo(webid, agentAccess, datasetUrl);
    });
};

export const setAccessWAC = async (
  datasetUrl = `${POD_URL}/yjs/docs`,
  agent = 'https://imp.inrupt.net/profile/card#me',
  access: Access = {
    read: true,
    append: true,
    write: true,
    control: true,
  }
) => {
  let datasetWithAcl: any = await loadDataset(datasetUrl, true);

  // Obtain the SolidDataset's own ACL, if available, or initialise a new one, if possible:
  let resourceAcl;
  if (!hasResourceAcl(datasetWithAcl)) {
    if (!hasAccessibleAcl(datasetWithAcl)) {
      throw new Error(
        'The current user does not have permission to change access rights to this Resource.'
      );
    }
    if (!hasFallbackAcl(datasetWithAcl)) {
      throw new Error(
        'The current user does not have permission to see who currently has access to this Resource.'
      );
    }
    resourceAcl = createAclFromFallbackAcl(datasetWithAcl);
    console.log('INFO - Created new ACL from fallback ACL');
  } else {
    resourceAcl = getResourceAcl(datasetWithAcl);
  }

  const updatedAcl: any = setAgentResourceAccess(resourceAcl, agent, access);

  await saveAclFor(datasetWithAcl, updatedAcl, { fetch: fetch });

  console.log('Updated ACL', updatedAcl);
};

const hasCreatorAccessToDatasetWAC = (
  datasetWithAcl: any,
  webId: string | undefined
) => {
  let accessByAgent = getAgentAccessAll(datasetWithAcl);

  if (accessByAgent && webId) {
    for (const [agent, access] of Object.entries(accessByAgent)) {
      if (agent === webId && access.control) {
        return true;
      }
    }
  }

  return false;
};

export class SolidPersistence extends Observable<string> {
  public name: string;
  public doc: Y.Doc;
  public loggedIn: boolean;
  public session: Session;
  public dataset: any;
  public thing: any;
  public datasetUrl: string;
  public hasCreatorAccess: boolean;

  private isUpdating: boolean;
  private hasFurtherUpdates: boolean;

  private constructor(
    name: string,
    doc: Y.Doc,
    session: Session,
    dataset: any,
    datasetUrl: string,
    thing: any,
    hasCreatorAccess: boolean
  ) {
    super();

    this.name = name;
    this.doc = doc;

    this.dataset = dataset;
    this.datasetUrl = datasetUrl;
    this.thing = thing;

    this.session = session;
    this.loggedIn = this.session.info.isLoggedIn;
    this.hasCreatorAccess = hasCreatorAccess;

    this.isUpdating = false;
    this.hasFurtherUpdates = false;

    this.doc.on('update', (update, origin) => {
      // ignore updates applied by this provider
      if (origin !== this) {
        // this update was produced either locally or by another provider.
        if (this.isUpdating) {
          // this provider is currently applying updates from the store.
          this.hasFurtherUpdates = true;
        } else {
          this.emit('update', [update]);
        }
      } else {
        console.log('Update is from this provider');
      }
    });

    // listen to an event that fires when a remote update is received
    this.on('update', async (update: Uint8Array) => {
      this.isUpdating = true;
      await this.update(update);

      // if there are more updates in the meantime, update to the latest state
      while (this.hasFurtherUpdates) {
        this.hasFurtherUpdates = false;
        await this.update(update);
      }

      this.isUpdating = false;
    });
  }

  public static async create(
    name: string,
    doc: Y.Doc,
    autoLogin = true,
    datasetUrl = `${POD_URL}/yjs/docs`
  ): Promise<SolidPersistence> {
    let session: Session, datasetWithAcl: any, thing: any, hasCreatorAccess;

    // LOGIN
    if (autoLogin) {
      session = await login();
    } else {
      await handleIncomingRedirect();
      session = getDefaultSession();
    }

    // SYNC DOC
    console.log('Syncing doc');
    datasetWithAcl = await loadDataset(datasetUrl, false);
    console.log('Dataset loaded without acl', datasetWithAcl);
    let value;
    if (datasetWithAcl) {
      thing = getYDocThing(datasetWithAcl, datasetUrl, name);
      value = getYDocValue(thing, name);

      console.log('Thing', thing);
      console.log('Value', value);

      // SET ACCESS INFO
      /*hasCreatorAccess = hasCreatorAccessToDatasetWAC(
        datasetWithAcl,
        session.info.webId
      );*/
      hasCreatorAccess = false;
    } else {
      datasetWithAcl = createSolidDataset();
      hasCreatorAccess = true;
    }

    if (value) {
      console.log('efore update', doc.toJSON());
      Y.applyUpdate(doc, value);
      console.log('Applied update', doc.toJSON());
    } else {
      thing = createYDocThing(name, doc);
      datasetWithAcl = setThing(datasetWithAcl, thing);
      await saveDataset(datasetWithAcl, datasetUrl);
    }

    return new SolidPersistence(
      name,
      doc,
      session,
      datasetWithAcl,
      datasetUrl,
      thing,
      hasCreatorAccess
    );
  }

  public async update(update: Uint8Array) {
    if (this.loggedIn) {
      await this.fetchPod(); // dataset and thing need to be fetched before an update (avoid 409)

      Y.applyUpdate(this.doc, update, this);

      this.thing = updateYDocThing(this.thing, this.doc);
      this.dataset = setThing(this.dataset, this.thing);
      await saveDataset(this.dataset, this.datasetUrl);
    } else {
      console.log('Cannot sync update - not logged in');
    }
  }

  public async fetchPod() {
    if (this.loggedIn) {
      this.dataset = await loadDataset(this.datasetUrl);
      this.thing = getYDocThing(this.dataset, this.datasetUrl, this.name);
      let value = getYDocValue(this.thing, this.name);
      if (value) Y.applyUpdate(this.doc, value);
    } else {
      console.log('Cannot fetch - not logged in');
    }
  }

  public async setAgentAccess(
    webId: string,
    access: Access = {
      read: true,
      append: true,
      write: true,
      control: false,
    }
  ) {
    if (this.loggedIn) {
      await setAccessWAC(this.datasetUrl, this.session.info.webId, access);
    } else {
      console.log('Cannot set access - not logged in');
    }
  }

  public async saveDataset() {
    this.dataset = await saveDataset(this.dataset, this.datasetUrl);
    console.log('dataset saved', this.dataset);
    this.emit('saved', [this]);
  }
}
