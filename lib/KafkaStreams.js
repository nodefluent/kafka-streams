"use strict";

const EventEmitter = require("events");

const KafkaFactory = require("./KafkaFactory.js");
const KStream = require("./dsl/KStream.js");
const KTable = require("./dsl/KTable.js");
const KStorage = require("./KStorage.js");

/**
 * Stream object factory
 * inhabits EventEmitter(events)
 */
class KafkaStreams extends EventEmitter {

    /**
     * Can be used as factory to get
     * pre-build KStream and KTable instances
     * injected with a KafkaClient instance
     * and with a KStorage instance
     * @param {object} config
     * @param {KStorage} storageClass
     * @param {object} storageOptions
     * @param {boolean} disableStorageTest
     */
    constructor(config, storageClass = null, storageOptions = {}, disableStorageTest = false){
        super();

        this.config = config;

        if(!this.config || typeof this.config !== "object"){
            throw new Error("Config must be a valid object.");
        }

        this.factory = new KafkaFactory(this.config, this.config.batchOptions);
        this.storageClass = storageClass || KStorage;
        this.storageOptions = storageOptions;

        this.kafkaClients = [];
        this.storages = [];

        if(!disableStorageTest){
            KafkaStreams.checkStorageClass(this.storageClass);
        }
    }

    static checkStorageClass(storageClass){

        let test = null;
        try {
            test = new storageClass();
        } catch(_){
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
        const storage = new this.storageClass(this.storageOptions);
        this.storages.push(storage);
        return storage;
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
     * get a new KStream instance
     * based on most.js
     * @param stream$
     * @param storage
     * @returns {KStream}
     */
    fromMost(stream$, storage = null){
        const kstream = this.getKStream(null, storage);
        kstream.replaceInternalObservable(stream$);
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
     * and any storage instance
     * that has every been created by this factory
     * @returns {Promise}
     */
    closeAll(){
        return Promise.all(this.kafkaClients.map(client => {
            return new Promise(resolve => {
                client.close();
                setTimeout(resolve, 750, true); //give client time for disconnect events
            });
        })).then(() => {
            this.kafkaClients = [];
            return Promise.all(this.storages.map(storage => storage.close())).then(() => {
                this.storages = [];
                super.emit("closed");
                return true;
            });
        });
    }
}

module.exports = KafkaStreams;
