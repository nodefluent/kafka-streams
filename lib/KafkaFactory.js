"use strict";

const KafkaClient = require("./KafkaClient.js");

class KafkaFactory {

    /**
     * helper for KafkaStreams to wrap
     * the setup of Kafka-Client instances
     * @param config
     */
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
