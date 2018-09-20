"use strict";

const EventEmitter = require("events");

class KafkaClient extends EventEmitter {

    constructor(){
        super();
    }

    static _getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = KafkaClient;
