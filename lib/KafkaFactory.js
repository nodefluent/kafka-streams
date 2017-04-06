"use strict";

const Sinek = require("sinek");

class KafkaFactory {

    constructor(config){

        if(KafkaFactory.instance){
            return KafkaFactory.instance;
        }

        if(!config){
            throw new Error("kafka factory constructor expects a configuration object.");
        }

        this.config = config;

        KafkaFactory.instance = this;
        return this;
    }

    getConsumer(topic){

    }

    getProducer(topic){

    }
}

module.exports = KafkaFactory;