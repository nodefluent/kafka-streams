"use strict";

const Promise = require("bluebird");

/**
 * used to count keys in a stream
 */
class KeyCount {

    constructor(storage, key, fieldName = "count") {
        this.storage = storage;
        this.key = key;
        this.fieldName = fieldName;
    }

    execute(value){

        if(!value || typeof value[this.key] === "undefined"){
            return Promise.resolve(value);
        }

        return this.storage.increment(value[this.key]).then(count => {
            value[this.fieldName] = count;
            return value;
        });
    }
}

module.exports = KeyCount;
