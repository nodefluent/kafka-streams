"use strict";

const uuid = require("uuid");
const {NConsumer, NProducer} = require("sinek");
const debug = require("debug")("kafka-streams:nativeclient");

const KafkaClient = require("./KafkaClient.js");

const NOOP = () => {};

class NativeKafkaClient extends KafkaClient {

    /**
     * NativeKafkaClient (EventEmitter)
     * that wraps an internal instance of a
     * Sinek native kafka- Consumer and/or Producer
     * @param topic
     * @param config
     * @param batchOptions - optional
     */
    constructor(topic, config, batchOptions = undefined){
        super();

        this.topic = topic;
        this.config = config;
        this.batchOptions = batchOptions;

        this.consumer = null;
        this.producer = null;

        this.produceTopic = null;
        this.producePartitionCount = 1;
        this._produceHandler = null;
    }

    /**
     * sets a handler for produce messages
     * (emits whenever kafka messages are produced/delivered)
     * @param handler {EventEmitter}
     */
    setProduceHandler(handler){
        this._produceHandler = handler;
    }

    /**
     * returns the produce handler instance if present
     * @returns {null|EventEmitter}
     */
    getProduceHandler(){
        return this._produceHandler;
    }

    /**
     * overwrites the topic
     * @param topics {Array<string>}
     */
    overwriteTopics(topics){
        this.topic = topics;
    }

    adjustDefaultPartitionCount(partitionCount = 1){
        this.producePartitionCount = partitionCount;
        this.producer.defaultPartitionCount = partitionCount;
    }

    /**
     * starts a new kafka consumer
     * will await a kafka-producer-ready-event if started withProducer=true
     * @param readyCallback
     * @param kafkaErrorCallback
     * @param withProducer
     * @param withBackPressure
     */
    start(readyCallback = null, kafkaErrorCallback = null, withProducer = false, withBackPressure = false){

        //might be possible if the parent stream is build to produce messages only
        if(!this.topic || !this.topic.length){
            return;
        }

        //passing batch options will always result in backpressure mode
        if(this.batchOptions){
            withBackPressure = true;
        }

        kafkaErrorCallback = kafkaErrorCallback || NOOP;

        this.consumer = new NConsumer(this.topic, this.config);

        this.consumer.on("ready", readyCallback || NOOP);
        this.consumer.on("error", kafkaErrorCallback);

        //consumer has to wait for producer
        super.once("kafka-producer-ready", () => {

            const streamOptions = {
                asString: false,
                asJSON: false
            };

            //if backpressure is desired, we cannot connect in streaming mode
            //if it is not we automatically connect in stream mode
            this.consumer.connect(!withBackPressure, streamOptions).then(() => {
                debug("consumer ready");

                if (withBackPressure) {
                    this.consumer.consume((message, done) => {
                        super.emit("message", message);
                        done();
                    }, false, false, this.batchOptions).catch(e => kafkaErrorCallback(e));
                } else {
                    this.consumer.consume().catch(e => kafkaErrorCallback(e));
                    this.consumer.on("message", message => {
                        super.emit("message", message);
                    });
                }
            }).catch(e => kafkaErrorCallback(e));
        });

        if(!withProducer){
            super.emit("kafka-producer-ready", true);
        }
    }

    /**
     * starts a new kafka-producer
     * will fire kafka-producer-ready-event
     * requires a topic's partition count during initialisation
     * @param produceTopic
     * @param partitions
     * @param readyCallback
     * @param kafkaErrorCallback
     * @param outputKafkaConfig
     */
    setupProducer(produceTopic, partitions = 1, readyCallback = null, kafkaErrorCallback = null, outputKafkaConfig = null){

        this.produceTopic = produceTopic || this.produceTopic;
        this.producePartitionCount = partitions;

        kafkaErrorCallback = kafkaErrorCallback || NOOP;

        const config = outputKafkaConfig || this.config;

        //might be possible if the parent stream is build to produce messages only
        if(!this.producer){
            this.producer = new NProducer(config, [this.produceTopic], this.producePartitionCount);

            //consumer is awaiting producer
            this.producer.on("ready", () => {
                debug("producer ready");
                super.emit("kafka-producer-ready", true);
                if(readyCallback){
                    readyCallback();
                }
            });

            this.producer.on("error", kafkaErrorCallback);
            this.producer.connect().catch(e => kafkaErrorCallback(e));
        }
    }

    //async send(topicName, message, _partition = null, _key = null, _partitionKey = null, _opaqueKey = null)

    /**
     * simply produces a message or multiple on a topic
     * if producerPartitionCount is > 1 it will randomize
     * the target partition for the message/s
     * @param topicName
     * @param message
     * @param partition - optional
     * @param key - optional
     * @param partitionKey - optional
     * @param opaqueKey - optional
     * @returns {Promise<void>}
     */
    send(topicName, message, partition = null, key = null, partitionKey = null, opaqueKey = null){

        if(!this.producer){
            return Promise.reject("producer is not yet setup.");
        }

        return this.producer.send(topicName, message, partition, key, partitionKey, opaqueKey);
    }

    /**
     * buffers a keyed message to be send
     * a keyed message needs an identifier, if none is provided
     * an uuid.v4() will be generated
     * @param topic
     * @param identifier
     * @param payload
     * @param _ - optional
     * @param partition - optional
     * @param version - optional
     * @param partitionKey - optional
     * @returns {Promise<void>}
     */
    buffer(topic, identifier, payload, _ = null, partition = null, version = null, partitionKey = null){

        if(!this.producer){
            return Promise.reject("producer is not yet setup.");
        }

        return this.producer.buffer(topic, identifier, payload, partition, version, partitionKey);
    }

    /**
     * buffers a keyed message in (a base json format) to be send
     * a keyed message needs an identifier, if none is provided
     * an uuid.4() will be generated
     * @param topic
     * @param identifier
     * @param payload
     * @param version - optional
     * @param _ - optional
     * @param partitionKey - optional
     * @param partition - optional
     * @returns {Promise<void>}
     */
    bufferFormat(topic, identifier, payload, version = 1, _ = null, partitionKey = null, partition = null){

        if(!this.producer){
            return Promise.reject("producer is not yet setup.");
        }

        if(!identifier){
            identifier = uuid.v4();
        }

        return this.producer.bufferFormatPublish(topic, identifier, payload, version, undefined, partitionKey, partition);
    }

    pause(){

        //no consumer pause

        if(this.producer){
            this.producer.pause();
        }
    }

    resume(){

       //no consumer resume

        if(this.producer){
            this.producer.resume();
        }
    }

    getStats(){
        return {
            inTopic: this.topic ? this.topic : null,
            consumer: this.consumer ? this.consumer.getStats() : null,

            outTopic: this.produceTopic ? this.produceTopic : null,
            producer: this.producer ? this.producer.getStats() : null
        };
    }

    close(commit = false){

        if (this.consumer) {
            this.consumer.close(commit);
        }

        if (this.producer) {
            this.producer.close();
        }
    }

    //required by KTable
    closeConsumer(commit = false){

        if(this.consumer){
            this.consumer.close(commit);
            this.consumer = null;
        }
    }
}

module.exports = NativeKafkaClient;
