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
  getThing,
  saveSolidDatasetAt,
  getSolidDataset,
} from '@inrupt/solid-client';
import { RDF, SCHEMA_INRUPT, AS } from '@inrupt/vocab-common-rdf';
import { Todo } from './store';

const POD_URL = 'https://truthless.inrupt.net';

export const login = async (
  oidcIssuer = 'https://inrupt.net/',
  clientName = 'SyncedStore'
): Promise<Session> => {
  await handleIncomingRedirect();

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

export class SolidPersistence extends Observable<string> {
  public name: string;
  public doc: Y.Doc;
  public loggedIn: boolean;
  public session: Session;
  public dataset: any;

  private storeUpdate = (update: any, origin: any) => {};

  private constructor(name: string, doc: Y.Doc, session: Session) {
    console.log('SolidPersistence constructor');
    super();

    this.name = name;
    this.doc = doc;

    this.dataset = this.createDataset();

    this.session = session;
    this.loggedIn = this.session.info.isLoggedIn;

    this.storeUpdate = (update: any, origin: any) => {
      console.log('store update', update, origin, this);
      if (this.loggedIn) {
        console.log('logged in');
      } else {
        console.log('not logged in');
      }
    };

    doc.on('update', this.storeUpdate);
  }

  public static async create(
    name: string,
    doc: any
  ): Promise<SolidPersistence> {
    await handleIncomingRedirect();

    let session = getDefaultSession();

    return new SolidPersistence(name, doc, session);
  }

  public async loadDataset(url = `${POD_URL}/yjs/todolist`) {
    let dataset = await getSolidDataset(
      url,
      { fetch: fetch } // fetch function from authenticated session
    );

    this.dataset = dataset;

    const todoThing: any = getThing(dataset, `${url}#todolist1`);

    const todoValue: any = getStringNoLocale(todoThing, SCHEMA_INRUPT.value);

    console.log('todoThing', todoThing);
    console.log('todoValue', todoValue);

    const update = toUint8Array(todoValue);
    const state = Y.decodeStateVector(update);

    console.log('update', update);
    console.log('state', state);

    const doc1 = new Y.Doc();
    Y.applyUpdate(doc1, update);
    Y.applyUpdate(this.doc, update);

    console.log('doc1 json', doc1.toJSON());

    console.log('dataset synced', this.dataset);
    this.emit('loaded', [this]);
    return dataset;
  }

  public createDataset() {
    let dataset = createSolidDataset();

    const newThing = buildThing(createThing({ name: 'yjs1' }))
      .addStringNoLocale(SCHEMA_INRUPT.name, 'SyncedStore Demo')
      .addUrl(RDF.type, 'https://schema.org/DigitalDocument')
      .build();

    console.log('I am called newThing', newThing);

    let newDataset = setThing(dataset, newThing);

    return newDataset;
  }

  public async saveDataset(dataset: any, url = `${POD_URL}/yjs/todolist`) {
    const savedSolidDataset = await saveSolidDatasetAt(
      url,
      dataset,
      { fetch: fetch } // fetch from authenticated Session
    );
    console.log('dataset saved', savedSolidDataset);

    this.dataset = dataset;
    this.emit('saved', [this]);
  }

  public async addThingToDataset() {
    let dataset = createSolidDataset();

    console.log('current doc state', this.doc.toJSON());

    const newTodo = buildThing(createThing({ name: `todolist1` }))
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

    await this.saveDataset(dataset);

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
