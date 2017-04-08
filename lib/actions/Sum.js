"use strict";

const Promise = require("bluebird");

class Sum {

    constructor(storage, key = "key", fieldName = "value") {
        this.storage = storage;
        this.key = key;
        this.fieldName = fieldName;
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

        return this.storage.get(element[this.key]).then(oldValue => {

            const newValue = Sum.tryConvertFloat(element[this.fieldName]);

            if(!oldValue){
                return this.storage.set(element[this.key], newValue).then(_ => {
                    element[this.fieldName] = newValue;
                    return element;
                })
            }

            const summedValue = oldValue + newValue;
            return this.storage.set(element[this.key], summedValue).then(_ => {
                element[this.fieldName] = summedValue;
                return element;
            })
        });
    }
}

module.exports = Sum;