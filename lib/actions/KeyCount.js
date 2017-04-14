"use strict";

const Promise = require("bluebird");

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

        console.log(`incrementing ${value[this.key]}`);

        return this.storage.increment(value[this.key]).then(count => {
            value[this.fieldName] = count;
            return value;
        });
    }
}

module.exports = KeyCount;