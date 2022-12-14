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

export class YDocThing<T extends Thing> {
  private thing: T;
  public value: Uint8Array;

  constructor(thing: T) {
    this.thing = thing;
    this.value = toUint8Array(
      getStringNoLocale(thing, SCHEMA_INRUPT.value) || ''
    );
  }
}
