import { Promise } from "bluebird";
import { KStorage } from "../KStorage";

/**
 * used to sum up key values in a stream
 */
export class Sum {
	public storage: KStorage;
	public key: string;
	public fieldName: string;
	public sumField: string;

	/**
	 * Creates an instance of Sum.
	 * @param {KStorage} storage
	 * 	 The store.
	 * @param {string} [key="key"]
	 * 	 The key.
	 * @param {string} [fieldName="value"]
	 * 	 The field name.
	 * @param {string} [sumField=null]
	 * 	The field to store the sum value in.
	 */
	constructor(storage: KStorage, key = "key", fieldName = "value", sumField: string | boolean = null) {
	  this.storage = storage;
	  this.key = key;
	  this.fieldName = fieldName;
	  this.sumField = (sumField && typeof sumField === "string") ? sumField : fieldName;
	}

	static tryConvertFloat(value: string | number): number {

	  const parsed = parseFloat(value as string);
	  if (!isNaN(parsed)) {
	    return parsed;
	  }

	  return value as number;
	}

	execute(element): number {

	  if (!element || typeof element[this.key] === "undefined") {
	    return Promise.resolve(element);
	  }

	  const newValue = Sum.tryConvertFloat(element[this.fieldName]);
	  return this.storage.sum(element[this.key], newValue).then(sum => {
	    element[this.sumField] = sum;
	    return element;
	  });
	}
}
