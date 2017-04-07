"use strict";

//TODO implement sinek/kafka client
const {} = require("sinek");

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
        return null;
    }

    getProducer(topic){
        return null;
    }
}

module.exports = KafkaFactory;