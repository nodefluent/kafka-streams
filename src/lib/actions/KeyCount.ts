import { Promise } from "bluebird";

/**
 * used to count keys in a stream
 */
export class KeyCount {
	public storage: any;
	public key: any;
	public fieldName: any;

	constructor(storage, key, fieldName = "count") {
	  this.storage = storage;
	  this.key = key;
	  this.fieldName = fieldName;
	}

	execute(value) {

	  if (!value || typeof value[this.key] === "undefined") {
	    return Promise.resolve(value);
	  }

	  return this.storage.increment(value[this.key]).then(count => {
	    value[this.fieldName] = count;
	    return value;
	  });
	}
}
