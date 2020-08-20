import { Promise } from "bluebird";

/**
 * used to sum up key values in a stream
 */
export class Sum {
	public storage: any;
	public key: any;
	public fieldName: any;
	public sumField: any;

	constructor(storage, key = "key", fieldName = "value", sumField = false) {
	  this.storage = storage;
	  this.key = key;
	  this.fieldName = fieldName;
	  this.sumField = sumField || fieldName;
	}

	static tryConvertFloat(value) {

	  const parsed = parseFloat(value);
	  if (!isNaN(parsed)) {
	    return parsed;
	  }

	  return value;
	}

	execute(element) {

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
