import { Promise } from "bluebird";
import { Subscriber as Observer, Subscription } from "most";

export class KStorage implements Observer<any> {
	public options: any;
	public state: any;
  private _subscription: Subscription<any>;

	/**
	 * be aware that even though KStorage is built on Promises
	 * its operations must always be ATOMIC (or ACID) because
	 * the stream will access them parallel, therefore having
	 * an async get + async set operation will always yield
	 * in a large amount of missing get operations followed by
	 * set operations
	 */
	constructor(options) {
	  this.options = options;
	  this.state = {};
	}

	/* NOTE: there is no open() method, meaning the functions have to work lazily */

	set(key, value) {
	  this.state[key] = value;
	  return Promise.resolve(value);
	}

	setSmaller(key = "min", value) {

	  if (!this.state[key]) {
	    this.state[key] = value;
	  }

	  if (value < this.state[key]) {
	    this.state[key] = value;
	  }

	  return Promise.resolve(this.state[key]);
	}

	setGreater(key = "max", value) {

	  if (!this.state[key]) {
	    this.state[key] = value;
	  }

	  if (value > this.state[key]) {
	    this.state[key] = value;
	  }

	  return Promise.resolve(this.state[key]);
	}

	increment(key, by = 1) {
	  if (!this.state[key]) {
	    this.state[key] = by;
	  } else {
	    this.state[key] += by;
	  }
	  return Promise.resolve(this.state[key]);
	}

	sum(key, value) {
	  return this.increment(key, value);
	}

	get(key) {
	  return Promise.resolve(this.state[key]);
	}

	getState() {
	  return Promise.resolve(this.state);
	}

	setState(newState) {
	  this.state = newState;
	  return Promise.resolve(true);
	}

  start(subscription: Subscription<any>) {
    this._subscription = subscription;
    return Promise.resolve(true);
  }

	getMin(key = "min") {
	  return Promise.resolve(this.state[key]);
	}

	getMax(key = "max") {
	  return Promise.resolve(this.state[key]);
	}

	close() {
    this._subscription.unsubscribe();
	  return Promise.resolve(true);
	}

  next({ key, value }) {
    return this.set(key, value);
  }

  error(error) {
    // Not much to do in this context.
    console.error(error);
  }

  complete() {
    this._subscription.unsubscribe();
  }
}

export default KStorage;
