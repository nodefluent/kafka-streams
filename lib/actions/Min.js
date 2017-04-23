"use strict";

const Promise = require("bluebird");

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