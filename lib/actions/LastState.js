"use strict";

const Promise = require("bluebird");

class LastState {

    constructor(storage, key = "key", fieldName = "value") {
        this.storage = storage;
        this.key = key;
        this.fieldName = fieldName;
    }

    execute(value){

        if(!value || typeof value[this.key] === "undefined"){
            return Promise.resolve(value);
        }

        return this.storage.set(value[this.key], value[this.fieldName]).then(count => {
            return value;
        });
    }
}

module.exports = LastState;