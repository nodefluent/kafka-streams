"use strict";

const KafkaClient = require("./KafkaClient.js");

class KafkaFactory {

    constructor(config){

        if(!config){
            throw new Error("kafka factory constructor expects a configuration object.");
        }

        this.config = config;
    }

    getKafkaClient(topic){
       return new KafkaClient(topic, this.config);
    }
}

module.exports = KafkaFactory;