"use strict";

const Promise = require("bluebird");

/**
 * used to grab the highest value of key values
 * in a stream
 */
class Max {

    constructor(storage, fieldName = "value", max = "max") {
        this.storage = storage;
        this.fieldName = fieldName;
        this.max = max;
    }

    execute(element){

        if(!element || typeof element[this.fieldName] === "undefined"){
            return Promise.resolve(element);
        }

        return this.storage.setGreater(this.max, element[this.fieldName]).then(_ => {
            return element;
        });
    }
}

module.exports = Max;
