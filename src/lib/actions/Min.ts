import { Promise } from "bluebird";
import { KStorage } from "../KStorage";

/**
 * used grab the lowest value of
 * key values in a stream
 */
export class Min {
	public storage: KStorage;
	public fieldName: string;
	public min: string;

	constructor(storage: KStorage, fieldName = "value", min = "min") {
	  this.storage = storage;
	  this.fieldName = fieldName;
	  this.min = min;
	}

	execute(element): number {

	  if (!element || typeof element[this.fieldName] === "undefined") {
	    return Promise.resolve(element);
	  }

	  return this.storage.setSmaller(this.min, element[this.fieldName]).then(_ => {
	    return element;
	  });
	}
}
