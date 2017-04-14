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

    static checkStorageClass(storageClass){

        let test = null;
        try {
            test = new storageClass();
        } catch(e){
            throw new Error("storageClass should be a constructor.");
        }

        if(!(test instanceof KStorage)){
            throw new Error("storageClass should be a constructor that extends KStorage.");
        }
    }

    getKafkaClient(topic){
        const client = this.factory.getKafkaClient(topic);
        this.kafkaClients.push(client);
        return client;
    }

    getStorage(){
        return new this.storageClass(this.storageOptions);
    }

    /**
     * get a new KStream instance
     * representing the topic as change-log
     * @param topic
     * @param storage
     * @returns {KStream}
     */
    getKStream(topic, storage = null){

        const kstream = new KStream(topic,
            storage || this.getStorage(),
            this.getKafkaClient(topic));

        kstream.setKafkaStreamsReference(this);
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

        const ktable = new KTable(topic,
            keyMapETL,
            storage || this.getStorage(),
            this.getKafkaClient(topic));

        ktable.setKafkaStreamsReference(this);
        return ktable;
    }

    /**
     * returns array of statistics object
     * for each active kafka client in any
     * stream that has been created by this factory
     * stats will give good insights into consumer
     * and producer behaviour
     * warning: depending on the amount of streams you have created
     * this could result in a large object
     * @returns {Array}
     */
    getStats(){
        return this.kafkaClients.map(kafkaClient => kafkaClient.getStats());
    }

    /**
     * close any kafkaClient instance
     * that has every been created by this factory
     */
    closeAll(){
        this.kafkaClients.forEach(consumer => consumer.close());
        this.kafkaClients = [];
    }
}

module.exports = KafkaStreams;