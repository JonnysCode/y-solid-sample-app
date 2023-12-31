import { fromUint8Array, toUint8Array } from 'js-base64';

import { fetch } from '@inrupt/solid-client-authn-browser';

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
  getSolidDatasetWithAcl,
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
  await saveSolidDatasetAt(
    datasetUrl,
    dataset,
    { fetch: fetch } // fetch function from authenticated session
  );
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

const getContributors = (thing: Thing) => {
  return getStringNoLocaleAll(thing, DCTERMS.contributor);
};

const isContributor = (thing: Thing, webId: string) => {
  return getContributors(thing).includes(webId);
};

const getCreator = (thing: Thing) => {
  return getUrl(thing, DCTERMS.creator);
};

const isCreator = (thing: Thing, webId: string) => {
  return getCreator(thing) === webId;
};

const addContributorToThing = (thing: Thing, webId: string): Thing => {
  return setStringNoLocale(thing, DCTERMS.contributor, webId);
};

const addContributorToDataset = async (
  dataset: any,
  datasetUrl: string | Url,
  thing: Thing,
  webId: string
): Promise<void> => {
  thing = addContributorToThing(thing, webId);
  dataset = setThing(dataset, thing);
  await saveDataset(dataset, datasetUrl);
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
  public creator: string | null;
  public contributors: string[];

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

    this.creator = getCreator(thing);
    this.contributors = getContributors(thing);
  }

  public static async create(name: string, url: string, webId: string) {
    let dataset, thing, value;

    dataset = await loadDataset(url, false);

    if (dataset) {
      thing = getYDocThing(dataset, url, name);
    } else {
      dataset = createSolidDataset();
    }

    if (thing) {
      value = getYDocValue(thing) || new Uint8Array();

      if (!isContributor(thing, webId) && !isCreator(thing, webId)) {
        addContributorToDataset(dataset, url, thing, webId);
      }
    } else {
      value = new Uint8Array();
      thing = newYDocThing(name, value, webId);
      dataset = setThing(dataset, thing);
      await saveDataset(dataset, url);
    }

    return new SolidDataset(name, url, dataset, thing, value);
  }

  public fetch = async (): Promise<void> => {
    this.resource = await loadDataset(this.url, false);
    this.thing = getYDocThing(this.resource, this.url, this.name);
    this.value = getYDocValue(this.thing) || this.value;
  };

  public update = async (value: Uint8Array): Promise<void> => {
    this.thing = updateYDocThing(this.thing, value);
    this.resource = setThing(this.resource, this.thing);
    await this.save();
  };

  /** Fetching and updating must be done in sync
   *
   * @param applyFetch
   * @param applyUpdate
   * @param getValue
   */
  public fetchAndUpdate = async (
    applyFetch: (value: Uint8Array) => void,
    applyUpdate: () => void,
    getValue: () => Uint8Array,
    maxTries = 5
  ): Promise<void> => {
    let isSynced = false;

    while (!isSynced && maxTries > 0) {
      console.log(
        '[SolidDataset] Fetch and update attempt,',
        maxTries,
        'tries left'
      );
      await this.fetch();
      applyFetch(this.value);

      applyUpdate();

      try {
        await this.update(getValue());
        isSynced = true;
        console.log('[SolidDataset] Fetch and update success');
      } catch (e: any) {
        if (e.statusCode === 409) {
          console.log(
            '[SolidDataset] Conflict saving dataset, fetching required...'
          );
        } else {
          console.log('[SolidDataset] Error saving the dataset', e);
        }
        maxTries--;
      }
    }
  };

  public save = async (): Promise<void> => {
    await saveDataset(this.resource, this.url);
  };

  public addWebRtcConnection = async (
    connection: WebRtcConnection = randomWebRtcConnection()
  ): Promise<WebRtcConnection> => {
    await this.fetch();

    this.thing = addWebRtcConnection(this.thing, connection);
    this.resource = setThing(this.resource, this.thing);

    await this.save();

    return connection;
  };

  public getWebRtcConnection = (): WebRtcConnection | null => {
    return getWebRtcConnection(this.thing);
  };
}
