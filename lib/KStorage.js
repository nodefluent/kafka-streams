"use strict";

const Promise = require("bluebird");

class KStorage {

    constructor(){
        this.state = {};
    }

    set(key, value){
        this.state[key] = value;
        return Promise.resolve(true);
    }

    increment(key, by = 1){
        if(!this.state[key]){
            this.state[key] = by;
        } else {
            this.state[key] += 1;
        }
        return Promise.resolve(this.state[key]);
    }

    get(key){
        return Promise.resolve(this.state[key]);
    }
}

module.exports = KStorage;