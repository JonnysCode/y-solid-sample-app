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
  addStringNoLocale,
  getThing,
  saveSolidDatasetAt,
  getSolidDataset,
  Url,
  universalAccess,
  getSolidDatasetWithAcl,
  getAgentAccessAll,
  AgentAccess,
  getUrlAll,
  getStringNoLocaleAll,
  getUrl,
  Thing,
} from '@inrupt/solid-client';

import { RDF, SCHEMA_INRUPT, DCTERMS } from '@inrupt/vocab-common-rdf';

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

const newYDocThing = (
  name: string,
  value: Uint8Array,
  webId: string
): Thing => {
  const thing = buildThing(createThing({ name: name }))
    .addStringNoLocale(SCHEMA_INRUPT.name, 'SyncedStore Y.Doc')
    .addUrl(RDF.type, 'https://schema.org/DigitalDocument')
    .addUrl(RDF.type, 'https://docs.yjs.dev/api/y.doc')
    .addUrl(DCTERMS.creator, webId)
    .addStringNoLocale(DCTERMS.created, new Date().toISOString())
    .addStringNoLocale(SCHEMA_INRUPT.value, fromUint8Array(value))
    .build();

  return thing;
};

const dec2hex = (dec: number): string => {
  return dec.toString(16).padStart(2, '0');
};

const generateId = (len: number): string => {
  var arr = new Uint8Array((len || 40) / 2);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, dec2hex).join('');
};

const addWebRtcConnection = (
  thing: Thing,
  connection: WebRtcConnection
): Thing => {
  thing = addStringNoLocale(thing, 'https://webrtc.org/room', connection.room);

  if (connection.password) {
    thing = addStringNoLocale(
      thing,
      'https://webrtc.org/password',
      connection.password
    );
  }

  return thing;
};

const getWebRtcConnection = (thing: Thing): WebRtcConnection | null => {
  const room = getStringNoLocale(thing, 'https://webrtc.org/room');
  const password = getStringNoLocale(thing, 'https://webrtc.org/password');

  if (room) {
    return {
      room: room,
      password: password,
    };
  }

  return null;
};

const updateYDocThing = (thing: Thing, value: Uint8Array): Thing => {
  return setStringNoLocale(thing, SCHEMA_INRUPT.value, fromUint8Array(value));
};

const isContributor = (thing: Thing, webId: string) => {
  const contributors = getStringNoLocaleAll(thing, DCTERMS.contributor);
  console.log('contributors', contributors);
  return contributors.includes(webId);
};

const isCreator = (thing: Thing, webId: string) => {
  const creator = getUrl(thing, DCTERMS.creator);
  console.log('creator', creator);
  return creator === webId;
};

const addContributorToThing = (thing: Thing, webId: string): Thing => {
  return setStringNoLocale(thing, DCTERMS.contributor, webId);
};

const getYDocThing = (
  dataset: any,
  datasetUrl: string,
  name: string
): Thing | null => {
  return getThing(dataset, datasetUrl + '#' + name);
};

const getYDocValue = (thing: Thing) => {
  const value = getStringNoLocale(thing, SCHEMA_INRUPT.value);

  return value ? toUint8Array(value) : null;
};

export interface WebRtcConnection {
  room: string;
  password: string | null;
}

export const randomWebRtcConnection = (): WebRtcConnection => {
  return {
    room: `room@${generateId(6)}`,
    password: generateId(12),
  };
};

export class SolidDataset {
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

  public addWebRtcConnection = async (
    connection: WebRtcConnection = randomWebRtcConnection()
  ): Promise<WebRtcConnection> => {
    this.thing = addWebRtcConnection(this.thing, connection);
    this.resource = setThing(this.resource, this.thing);
    await this.save();

    return connection;
  };

  public getWebRtcConnection = (): WebRtcConnection | null => {
    return getWebRtcConnection(this.thing);
  };
}
