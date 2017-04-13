"use strict";

const KafkaFactory = require("./KafkaFactory.js");
const KStream = require("./KStream.js");
const KTable = require("./KTable.js");
const KStorage = require("./KStorage.js");

class KafkaStreams {

    /**
     * can be used as factory to get
     * pre-build KStream and KTable instances
     * injected with a KafkaClient instance
     * and with a KStorage instance
     * @param config
     * @param storageClass
     * @param storageOptions
     * @param disableStorageTest
     */
    constructor(config, storageClass = null, storageOptions = {}, disableStorageTest = false){

        this.config = config;

        this.factory = new KafkaFactory(config);
        this.storageClass = storageClass || KStorage;
        this.storageOptions = storageOptions;
        this.kafkaClients = [];

        if(!disableStorageTest){
            KafkaStreams.checkStorageClass(this.storageClass);
        }
    }

    static checkStorageClass(sclass){

        let test = null;
        try {
            test = new sclass();
        } catch(e){
            throw new Error("storageClass should be a constructor.");
        }

        if(!(test instanceof KStorage)){
            throw new Error("storageClass should be a constructor that extends KStorage.");
        }
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
        const kstream = new KStream(topic, storage || new this.storageClass(this.storageOptions), kafkaClient);
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
        const ktable = new KTable(topic, keyMapETL, storage || new this.storageClass(this.storageOptions), kafkaClient);
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