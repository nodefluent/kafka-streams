"use strict";

const Promise = require("bluebird");

/**
 * used grab the lowest value of
 * key values in a stream
 */
class Min {

    constructor(storage, fieldName = "value", min = "min") {
        this.storage = storage;
        this.fieldName = fieldName;
        this.min = min;
    }

    execute(element){

        if(!element || typeof element[this.fieldName] === "undefined"){
            return Promise.resolve(element);
        }

        return this.storage.setSmaller(this.min, element[this.fieldName]).then(_ => {
            return element;
        });
    }
}

module.exports = Min;
