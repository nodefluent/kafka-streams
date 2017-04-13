"use strict";

const KafkaFactory = require("./KafkaFactory.js");
const KStream = require("./KStream.js");
const KTable = require("./KTable.js");

class KafkaStreams {

    /**
     * can be used as factory to get
     * pre-build KStream and KTable instances
     * injected with a KafkaClient
     * @param config
     */
    constructor(config){

        this.config = config;

        this.factory = new KafkaFactory(config);
        this.kafkaClients = [];
    }

    /**
     * get a new KStream instance
     * representing the topic as change-log
     * @param topic
     * @param storage
     * @returns {KStream}
     */
    getKStream(topic, storage = null){
        const kafkaClient = this.factory.getKafkaClient(topic);
        const kstream = new KStream(topic, storage, kafkaClient);
        this.kafkaClients.push(kafkaClient);
        return kstream;
    }

    /**
     * get a new KTable instance
     * representing the topic as table like stream
     * @param topic
     * @param keyMapETL
     * @param storage
     * @returns {KTable}
     */
    getKTable(topic, keyMapETL, storage = null){
        const kafkaClient = this.factory.getKafkaClient(topic);
        const ktable = new KTable(topic, keyMapETL, storage, kafkaClient);
        this.kafkaClients.push(kafkaClient);
        return ktable;
    }

    /**
     * close any kafkaClient instance
     * that has every been created by this factory
     */
    closeAll(){
        this.kafkaClients.forEach(consumer => consumer.close());
    }
}

module.exports = KafkaStreams;