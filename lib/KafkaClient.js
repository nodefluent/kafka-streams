"use strict";

const EventEmitter = require("events");
const {} = require("sinek"); //TODO

class KafkaClient extends EventEmitter {

    constructor(topic, config){
        super();

        this.topic = topic;
        this.config = config;
    }

    send(topic, message){

    }

    start(){

    }

    pause(){

    }

    stop(){

    }

    close(){

    }
}

module.exports = KafkaClient;