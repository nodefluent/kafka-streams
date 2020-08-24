import { Promise } from "bluebird";
import { KStorage } from "../KStorage";

/**
 * used to count keys in a stream
 */
export class KeyCount {

	private storage: KStorage;
	public key: string;
	public fieldName: string;

	constructor(storage: KStorage, key: string, fieldName = "count") {
	  this.storage = storage;
	  this.key = key;
	  this.fieldName = fieldName;
	}

	execute(value): Promise<number> {

	  if (!value || typeof value[this.key] === "undefined") {
	    return Promise.resolve(value);
	  }

	  return this.storage.increment(value[this.key]).then(count => {
	    value[this.fieldName] = count;
	    return value;
	  });
	}
}
