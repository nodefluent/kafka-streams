"use strict";

const debug = require("debug")("kafka-streams:kafkafactory");

const JSKafkaClient = require("./JSKafkaClient.js");
const NativeKafkaClient = require("./NativeKafkaClient.js");

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

        if(this.config.noptions && typeof this.config.noptions === "object"){
            debug("creating new native kafka client");
            return new NativeKafkaClient(topic, this.config);
        }

        debug("creating new js kafka client");
        return new JSKafkaClient(topic, this.config);
    }
}

module.exports = KafkaFactory;
