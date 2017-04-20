"use strict";

const EventEmitter = require("events");
const uuid = require("uuid");
const {Kafka, PartitionDrainer, Publisher} = require("sinek");

const NOOP = () => {};

class KafkaClient extends EventEmitter {

    constructor(topic, config){
        super();

        this.topic = topic;
        this.config = config;

        this.kafkaConsumerClient = null;
        this.kafkaProducerClient = null;

        this.consumer = null;
        this.producer = null;

        this.produceTopic = null;
        this.producePartitionCount = 1;
    }

    /**
     * starts a new kafka consumer (using sinek's partition drainer)
     * will await a kafka-producer-ready-event if started withProducer=true
     * @param readyCallback
     * @param kafkaErrorCallback
     * @param withProducer
     */
    start(readyCallback = null, kafkaErrorCallback = null, withProducer = false){

        //might be possible if the parent stream is build to produce messages only
        if(!this.topic){
            return;
        }

        const {zkConStr, logger, groupId, workerPerPartition, options} = this.config;
        this.kafkaConsumerClient = new Kafka(zkConStr, logger);

        this.kafkaConsumerClient.on("ready", readyCallback || NOOP);
        this.kafkaConsumerClient.on("error", kafkaErrorCallback || NOOP);

        this.kafkaConsumerClient.becomeConsumer([this.topic], groupId, options || {});
        this.consumer = new PartitionDrainer(this.kafkaConsumerClient, workerPerPartition || 1, false, false);

        //consumer has to wait for producer
        super.once("kafka-producer-ready", () => {
            this.consumer.drain(this.topic, (message, done) => {
                super.emit("message", message);
                done();
            }).catch(e => kafkaErrorCallback(e));
        });

        if(!withProducer){
            super.emit("kafka-producer-ready", true);
        }
    }

    /**
     * starts a new kafka-producer using sinek's publisher
     * will fire kafka-producer-ready-event
     * requires a topic's partition count during initialisation
     * @param produceTopic
     * @param partitions
     * @param readyCallback
     * @param kafkaErrorCallback
     */
    setupProducer(produceTopic, partitions = 1, readyCallback = null, kafkaErrorCallback = null){

        this.produceTopic = produceTopic || this.produceTopic;
        this.producePartitionCount = partitions;
        const {zkConStr, logger, clientName, options} = this.config;

        //might be possible if the parent stream is build to produce messages only
        if(!this.kafkaProducerClient){
            this.kafkaProducerClient = new Kafka(zkConStr, logger);

            //consumer is awaiting producer
            this.kafkaProducerClient.on("ready", () => {
                super.emit("kafka-producer-ready", true);
                if(readyCallback){
                    readyCallback();
                }
            });

            this.kafkaProducerClient.on("error", kafkaErrorCallback || NOOP);
        }

        this.kafkaProducerClient.becomeProducer([this.produceTopic], clientName, options);
        this.producer = new Publisher(this.kafkaProducerClient, partitions || 1);
    }

    /**
     * if called with a number higher than 0
     * it will cause the producer's buffer to be flushed
     * automatically, its not active per default
     * @param bufferSize
     */
    enableProducerAutoBufferFlush(bufferSize = 500){
        if(this.producer){
            this.producer.setAutoFlushBuffer(bufferSize);
        }
    }

    /**
     * simply produces a message or multiple on a topic
     * if producerPartitionCount is > 1 it will randomize
     * the target partition for the message/s
     * @param topic
     * @param message
     * @returns {*}
     */
    send(topic, message){

        if(!this.producer){
            return Promise.reject("producer is not yet setup.");
        }

        let partition = -1;
        if(this.producePartitionCount < 2){
            partition = 0;
        } else {
            partition = KafkaClient._getRandomIntInclusive(0, this.producePartitionCount);
        }

        return this.producer.send(topic,
            Array.isArray(message) ? message : [message],
            null,
            partition,
            0
        );
    }

    /**
     * buffers a keyed message to be send
     * a keyed message needs an identifier, if none is provided
     * an uuid.v4() will be generated
     * @param topic
     * @param identifier
     * @param payload
     * @param compressionType
     * @returns {*}
     */
    buffer(topic, identifier, payload, compressionType = 0){

        if(!this.producer){
            return Promise.reject("producer is not yet setup.");
        }

        if(!identifier){
            identifier = uuid.v4();
        }

        return this.producer.appendBuffer(topic, identifier, payload, compressionType);
    }

    /**
     * buffers a keyed message in (a base json format) to be send
     * a keyed message needs an identifier, if none is provided
     * an uuid.4() will be generated
     * @param topic
     * @param identifier
     * @param payload
     * @param version
     * @param compressionType
     * @returns {*}
     */
    bufferFormat(topic, identifier, payload, version = 1, compressionType = 0){

        if(!this.producer){
            return Promise.reject("producer is not yet setup.");
        }

        if(!identifier){
            identifier = uuid.v4();
        }

        return this.producer.bufferPublishMessage(topic, identifier, payload, version, compressionType);
    }

    /**
     * you will have to use this if you
     * are working with .buffer() and have not set
     * an auto-flush-buffer-size via .enableProducerAutoBufferFlush()
     * otherwise the producer will not send any messages
     * @param topic
     */
    flushProducer(topic){
        if(this.producer){
            this.producer.flushBuffer(topic);
        }
    }

    pause(){

        if(this.kafkaConsumerClient){
            this.kafkaConsumerClient.pause();
        }

        if(this.kafkaProducerClient){
            this.kafkaProducerClient.pause();
        }
    }

    resume(){

        if(this.kafkaConsumerClient){
            this.kafkaConsumerClient.resume();
        }

        if(this.kafkaProducerClient){
            this.kafkaProducerClient.resume();
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

        if (this.kafkaConsumerClient) {
            this.kafkaConsumerClient.close(commit);
        }

        if (this.kafkaProducerClient) {
            this.kafkaProducerClient.close();
        }
    }

    static _getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = KafkaClient;
