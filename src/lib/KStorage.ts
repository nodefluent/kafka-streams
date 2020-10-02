import { Promise } from "bluebird";

export type KStorageState = {
	[key: string]: number;
}

export class KStorage {
	public options: any;
	public state: KStorageState;

	/**
	 * be aware that even though KStorage is built on Promises
	 * its operations must always be ATOMIC (or ACID) because
	 * the stream will access them parallel, therefore having
	 * an async get + async set operation will always yield
	 * in a large amount of missing get operations followed by
	 * set operations
	 */
	constructor(options?) {
	  this.options = options;
	  this.state = {};
	}

	/* NOTE: there is no open() method, meaning the functions have to work lazily */

	set(key: string, value: number): Promise<number>  {
	  this.state[key] = value;
	  return Promise.resolve(value);
	}

	setSmaller(key = "min", value: number): Promise<number> {

	  if (!this.state[key]) {
	    this.state[key] = value;
	  }

	  if (value < this.state[key]) {
	    this.state[key] = value;
	  }

	  return Promise.resolve(this.state[key]);
	}

	setGreater(key = "max", value: number): Promise<number> {

	  if (!this.state[key]) {
	    this.state[key] = value;
	  }

	  if (value > this.state[key]) {
	    this.state[key] = value;
	  }

	  return Promise.resolve(this.state[key]);
	}

	increment(key: string, by = 1): Promise<number> {
	  if (!this.state[key]) {
	    this.state[key] = by;
	  } else {
	    this.state[key] += by;
	  }
	  return Promise.resolve(this.state[key]);
	}

	sum(key: string, value: number): Promise<number> {
	  return this.increment(key, value);
	}

	get(key: string): Promise<number> {
	  return Promise.resolve(this.state[key]);
	}

	getState(): Promise<KStorageState> {
	  return Promise.resolve(this.state);
	}

	setState(newState: KStorageState): Promise<boolean> {
	  this.state = newState;
	  return Promise.resolve(true);
	}

	getMin(key = "min"): Promise<number> {
	  return Promise.resolve(this.state[key]);
	}

	getMax(key = "max"): Promise<number> {
	  return Promise.resolve(this.state[key]);
	}

	close(): Promise<boolean> {
	  return Promise.resolve(true);
	}
}
