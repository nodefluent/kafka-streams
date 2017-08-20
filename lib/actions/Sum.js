"use strict";

const Promise = require("bluebird");

/**
 * used to sum up key values in a stream
 */
class Sum {

    constructor(storage, key = "key", fieldName = "value", sumField = false) {
        this.storage = storage;
        this.key = key;
        this.fieldName = fieldName;
        this.sumField = sumField || fieldName;
    }

    static tryConvertFloat(value){

        const parsed = parseFloat(value);
        if(!isNaN(parsed)){
            return parsed;
        }

        return value;
    }

    execute(element){

        if(!element || typeof element[this.key] === "undefined"){
            return Promise.resolve(element);
        }

        const newValue = Sum.tryConvertFloat(element[this.fieldName]);
        return this.storage.sum(element[this.key], newValue).then(sum => {
            element[this.sumField] = sum;
            return element;
        });
    }
}

module.exports = Sum;
