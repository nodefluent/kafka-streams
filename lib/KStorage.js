"use strict";

const Promise = require("bluebird");

class KStorage {

    /**
     * be aware that even though KStorage is built on Promises
     * its operations must always be ATOMIC (or ACID) because
     * the stream will access them parallel, therefore having
     * an async get + async set operation will always yield
     * in a large amount of missing get operations followed by
     * set operations
     */
    constructor(options){
        this.options = options;
        this.state = {};
    }

    set(key, value){
        this.state[key] = value;
        return Promise.resolve(value);
    }

    increment(key, by = 1){
        if(!this.state[key]){
            this.state[key] = by;
        } else {
            this.state[key] += by;
        }
        return Promise.resolve(this.state[key]);
    }

    sum(key, value){
        return this.increment(key, value);
    }

    get(key){
        return Promise.resolve(this.state[key]);
    }
}

module.exports = KStorage;