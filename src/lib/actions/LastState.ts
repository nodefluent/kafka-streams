import { Promise } from "bluebird";
import { KStorage } from "../KStorage";

/**
 * used to hold the last state of key values
 * in a stream e.g. building KTables
 */
export class LastState {
	public storage: KStorage;
	public key: string;
	public fieldName: string;

	constructor(storage: KStorage, key = "key", fieldName = "value") {
	  this.storage = storage;
	  this.key = key;
	  this.fieldName = fieldName;
	}

	execute(element): number {

	  if (!element || typeof element[this.key] === "undefined") {
	    return Promise.resolve(element);
	  }

	  return this.storage.set(element[this.key], element[this.fieldName]).then(value => {
	    return element;
	  });
	}
}
