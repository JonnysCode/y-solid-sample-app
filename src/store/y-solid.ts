import { Observable } from 'lib0/observable';

import {
  handleIncomingRedirect,
  login,
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
  saveSolidDatasetAt,
  getSolidDataset,
} from '@inrupt/solid-client';
import { RDF, SCHEMA_INRUPT } from '@inrupt/vocab-common-rdf';

export class SolidPersistence extends Observable<string> {
  public name: string;
  public doc: any;
  public loggedIn: boolean;
  public session: Session;
  public dataset: any;

  private storeUpdate = (update: any, origin: any) => {};

  constructor(name: string, doc: any) {
    console.log('SolidPersistence constructor');
    super();

    this.name = name;
    this.doc = doc;

    this.dataset = this.createDataset();

    this.session = getDefaultSession();
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

  public async login() {
    await handleIncomingRedirect();

    this.session = getDefaultSession();

    if (!this.session.info.isLoggedIn) {
      await this.session.login({
        oidcIssuer: 'https://inrupt.net/',
        redirectUrl: window.location.href,
        clientName: 'Yjs Solid Demo',
      });
    }

    this.loggedIn = true;
    this.emit('login', [this]);
  }

  public async loadDataset(
    url = 'https://truthless.inrupt.net/yjs/documents/'
  ) {
    let dataset = await getSolidDataset(
      url,
      { fetch: fetch } // fetch function from authenticated session
    );

    this.dataset = dataset;

    const docs = getThingAll(dataset);

    console.log('docs loaded', docs);

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

  public async saveDataset(
    dataset = this.createDataset(),
    url = 'https://truthless.inrupt.net/yjs/documents/'
  ) {
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
    let dataset = await this.loadDataset();

    const newThing = buildThing(createThing({ name: 'yjs2' }))
      .addStringNoLocale(SCHEMA_INRUPT.name, 'SyncedStore Demo')
      .addUrl(RDF.type, 'https://schema.org/DigitalDocument')
      .build();

    let newDataset = setThing(dataset, newThing);

    console.log('newDataset', newDataset);

    await this.saveDataset(newDataset);

    console.log('new thing saved');
  }
}
