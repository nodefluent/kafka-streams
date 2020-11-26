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

  /**
   * Attaches existing subscription to storage class
   * @returns {Promise<boolean>}
   */
  start(subscription: Subscription<any>): Promise<boolean> {
    this._subscription = subscription;
    return Promise.resolve(true);
  }

	getMin(key = "min") {
	  return Promise.resolve(this.state[key]);
	}

	getMax(key = "max") {
	  return Promise.resolve(this.state[key]);
	}

  /**
   * Unsubscribe from observable
   *
   * @returns {Promise<boolean}
   */
	close(): Promise<boolean> {
    if (this._subscription)
      this._subscription.unsubscribe();
	  return Promise.resolve(true);
	}

  /**
   * Adapter for set(), taking an object with props key and value.
   * Called by the Observable API on write to a given topic, storing the
   * latest value for a given key in the store.
   *
   * @returns {Promise<any>} Promise that resolves with the value passed to function
   */
  next({ key, value }: { key: string, value: any }): Promise<any> {
    return this.set(key, value);
  }

  /**
   * Error handler for Observable
   *
   * @returns {void}
   */
  error(error): void {
    // Not much to do in this context.
    console.error(error);
  }

  /**
   * Unsubscribe from observable, required by Observable API
   *
   * @returns {void}
   */
  complete(): void {
    this._subscription.unsubscribe();
  }
}

export default KStorage;
