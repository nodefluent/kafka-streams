import { Promise } from "bluebird";
import { KStorage } from "../KStorage";

/**
 * used to grab the highest value of key values
 * in a stream
 */
export class Max {
	public storage: KStorage;
	public fieldName: string;
	public max: string;

	constructor(storage: KStorage, fieldName = "value", max = "max") {
	  this.storage = storage;
	  this.fieldName = fieldName;
	  this.max = max;
	}

	execute(element): number {

	  if (!element || typeof element[this.fieldName] === "undefined") {
	    return Promise.resolve(element);
	  }

	  return this.storage.setGreater(this.max, element[this.fieldName]).then(_ => {
	    return element;
	  });
	}
}
