"use strict";

const uuid = require("uuid");
const {NConsumer, NProducer} = require("sinek");
const KafkaClient = require("./KafkaClient.js");

const NOOP = () => {};

class NativeKafkaClient extends KafkaClient {

    /**
     * NativeKafkaClient (EventEmitter)
     * that wraps an internal instance of a
     * Sinek native kafka- Consumer and/or Producer
     * @param topic
     * @param config
     */
    constructor(topic, config){
        super();

        this.topic = topic;
        this.config = config;

        this.consumer = null;
        this.producer = null;

        this.produceTopic = null;
        this.producePartitionCount = 1;
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
        if(!this.topic){
            return;
        }

        kafkaErrorCallback = kafkaErrorCallback || NOOP;

        this.consumer = new NConsumer([this.topic], this.config);

        this.consumer.on("ready", readyCallback || NOOP);
        this.consumer.on("error", kafkaErrorCallback);

        //consumer has to wait for producer
        super.once("kafka-producer-ready", () => {

            this.consumer.connect().then(() => {

                if (withBackPressure) {
                    this.consumer.consume((message, done) => {
                        message.key = message.key.toString("utf8");
                        console.log("hi1->" + JSON.stringify(message));
                        super.emit("message", message);
                        done();
                    }).catch(e => kafkaErrorCallback(e));
                } else {
                    this.consumer.consume().catch(e => kafkaErrorCallback(e));
                    this.consumer.on("message", message => {
                        message.key = message.key.toString("utf8");
                        console.log("hi2->" + JSON.stringify(message));
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
     */
    setupProducer(produceTopic, partitions = 1, readyCallback = null, kafkaErrorCallback = null){

        this.produceTopic = produceTopic || this.produceTopic;
        this.producePartitionCount = partitions;

        kafkaErrorCallback = kafkaErrorCallback || NOOP;

        //might be possible if the parent stream is build to produce messages only
        if(!this.producer){
            this.producer = new NProducer(this.config, [this.produceTopic], this.producePartitionCount);

            //consumer is awaiting producer
            this.producer.on("ready", () => {
                super.emit("kafka-producer-ready", true);
                if(readyCallback){
                    readyCallback();
                }
            });

            this.producer.on("error", kafkaErrorCallback);
            this.producer.connect().catch(e => kafkaErrorCallback(e));
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

        console.log("sen->" + message);

        if(!this.producer){
            return Promise.reject("producer is not yet setup.");
        }

        const sends = (Array.isArray(message) ? message : [message])
            .map(m => this.producer.send(topic, m, null, null));

        return Promise.all(sends);
    }

    /**
     * buffers a keyed message to be send
     * a keyed message needs an identifier, if none is provided
     * an uuid.v4() will be generated
     * @param topic
     * @param identifier
     * @param payload
     * @returns {*}
     */
    buffer(topic, identifier, payload){

        console.log("buf->" + message);

        if(!this.producer){
            return Promise.reject("producer is not yet setup.");
        }

        return this.producer.buffer(topic, identifier, payload);
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
    bufferFormat(topic, identifier, payload, version = 1){

        console.log("buft->" + message);

        if(!this.producer){
            return Promise.reject("producer is not yet setup.");
        }

        if(!identifier){
            identifier = uuid.v4();
        }

        return this.producer.bufferFormatPublish(topic, identifier, payload, version);
    }

    pause(){

        /*
        if(this.consumer){
            this.consumer.pause();
        } */

        if(this.producer){
            this.producer.pause();
        }
    }

    resume(){

        /*
        if(this.consumer){
            this.consumer.resume();
        } */

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
            this.consumer = null;
        }

        if (this.producer) {
            this.producer.close();
            this.producer = null;
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
