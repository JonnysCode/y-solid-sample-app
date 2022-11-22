import { Observable } from 'lib0/observable';
import * as Y from 'yjs';
import { fromBase64, fromUint8Array, toUint8Array } from 'js-base64';

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
} from '@inrupt/solid-client';
import { RDF, SCHEMA_INRUPT, AS } from '@inrupt/vocab-common-rdf';
import { Todo } from './store';

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

const loadDataset = async (datasetUrl: string | Url) => {
  let dataset;
  try {
    dataset = await getSolidDataset(
      datasetUrl,
      { fetch: fetch } // fetch function from authenticated session
    );
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

export class SolidPersistence extends Observable<string> {
  public name: string;
  public doc: Y.Doc;
  public loggedIn: boolean;
  public session: Session;
  public dataset: any;
  public thing: any;
  public datasetUrl: string;

  private storeUpdate = (update: any, origin: any) => {};

  private constructor(
    name: string,
    doc: Y.Doc,
    session: Session,
    dataset: any,
    datasetUrl: string,
    thing: any
  ) {
    super();

    this.name = name;
    this.doc = doc;

    this.dataset = dataset;
    this.datasetUrl = datasetUrl;
    this.thing = thing;

    this.session = session;
    this.loggedIn = this.session.info.isLoggedIn;

    this.storeUpdate = (update: any, origin: any) => {
      console.log('store update', update, origin, this);
      if (this.loggedIn) {
      } else {
        console.log('not logged in');
      }
    };

    this.doc.on('update', (update, origin) => {
      // ignore updates applied by this provider
      if (origin !== this) {
        // this update was produced either locally or by another provider.
        this.emit('update', [update]);
      } else {
        console.log('Update is from this provider');
      }
    });

    // listen to an event that fires when a remote update is received
    this.on('update', (update: Uint8Array) => {
      this.update(update);
    });
  }

  public static async create(
    name: string,
    doc: any,
    autoLogin = true,
    datasetUrl = `${POD_URL}/yjs/docs`
  ): Promise<SolidPersistence> {
    let session: Session, dataset: any, thing: any;

    // LOGIN
    if (autoLogin) {
      session = await login();
    } else {
      await handleIncomingRedirect();
      session = getDefaultSession();
    }

    // SYNC DOC
    dataset = await loadDataset(datasetUrl);
    let value;
    if (dataset) {
      console.log('Dataset found', dataset);
      thing = getYDocThing(dataset, datasetUrl, name);
      value = getYDocValue(thing, name);
    } else {
      dataset = createSolidDataset();
    }

    if (value) {
      console.log('Y.Doc found', value);
      Y.applyUpdate(doc, value);
    } else {
      thing = createYDocThing(name, doc);
      dataset = setThing(dataset, thing);
      await saveDataset(dataset, datasetUrl);
    }

    return new SolidPersistence(name, doc, session, dataset, datasetUrl, thing);
  }

  public async update(update: Uint8Array) {
    console.log('update', update, this);
    Y.applyUpdate(this.doc, update, this);
    if (this.loggedIn) {
      this.thing = updateYDocThing(this.thing, this.doc);
      this.dataset = setThing(this.dataset, this.thing);
      await saveDataset(this.dataset, this.datasetUrl);
    } else {
      console.log('Cannot sync update - not logged in');
    }
  }

  public async loadDataset(url = `${POD_URL}/yjs/docs`) {
    let dataset = await getSolidDataset(
      url,
      { fetch: fetch } // fetch function from authenticated session
    );

    this.dataset = dataset;

    const todoThing: any = getThing(dataset, `${url}#${this.name}`);
    const todoValue: any = getStringNoLocale(todoThing, SCHEMA_INRUPT.value);

    const update = toUint8Array(todoValue);

    Y.applyUpdate(this.doc, update);

    console.log('dataset loaded and doc updated', this.dataset, this.doc);
    this.emit('loaded', [this]);
    return dataset;
  }

  public async saveDataset() {
    this.dataset = await saveDataset(this.dataset, this.datasetUrl);
    console.log('dataset saved', this.dataset);
    this.emit('saved', [this]);
  }

  public async addThingToDataset() {
    let dataset = createSolidDataset();

    console.log('current doc state', this.doc.toJSON());

    const newTodo = buildThing(createThing({ name: this.name }))
      .addStringNoLocale(SCHEMA_INRUPT.name, 'SyncedStore Demo')
      .addUrl(RDF.type, 'https://schema.org/DigitalDocument')
      .addUrl(RDF.type, 'https://docs.yjs.dev/api/y.doc')
      .addStringNoLocale(
        SCHEMA_INRUPT.value,
        fromUint8Array(Y.encodeStateAsUpdate(this.doc))
      )
      .build();
    dataset = setThing(dataset, newTodo);

    console.log('newDataset', dataset);

    await this.saveDataset();

    console.log('new todolist saved');
  }

  public async newReadingList() {
    const titles = [
      'The Lord of the Rings',
      'The Hobbit',
      "Harry Potter and the Philosopher's Stone",
      'And Then There Were None',
      'Dream of the Red Chamber',
      'The Little Prince',
    ];

    let readingListUrl = `${POD_URL}/reading-list/myList`;
    let myReadingList = createSolidDataset();

    // Add titles to the Dataset
    let i = 0;
    titles.forEach((title) => {
      if (title.trim() !== '') {
        let item = createThing({ name: 'title' + i });
        item = addUrl(item, RDF.type, AS.Article);
        item = addStringNoLocale(item, SCHEMA_INRUPT.name, title);
        myReadingList = setThing(myReadingList, item);
        i++;
      }
    });

    try {
      // Save the SolidDataset
      let savedReadingList = await saveSolidDatasetAt(
        readingListUrl,
        myReadingList,
        { fetch: fetch }
      );
    } catch (error) {
      console.log('ERROR saving the reading list', error);
    }
  }
}
