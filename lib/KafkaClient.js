"use strict";

const EventEmitter = require("events");
const {Kafka, PartitionDrainer, Publisher} = require("sinek");

const NOOP = () => {};

class KafkaClient extends EventEmitter {

    constructor(topic, config){
        super();

        this.topic = topic;
        this.config = config;

        this.kafkaClient = null;
        this.consumer = null;
        this.producer = null;
        this.produceTopic = null;
    }

    start(readyCallback = null, kafkaErrorCallback = null){

        //might be possible if the parent stream is build to produce messages only
        if(!this.topic){
            return;
        }

        const {zkConStr, logger, groupId, workerPerPartition, options} = this.config;
        this.kafkaClient = new Kafka(zkConStr, logger);

        this.kafkaClient.on("ready", readyCallback || NOOP);
        this.kafkaClient.on("error", kafkaErrorCallback || NOOP);

        this.kafkaClient.becomeConsumer([this.topic], groupId, options || {});

        this.consumer = new PartitionDrainer(this.kafkaClient, workerPerPartition || 1);
        return this.consumer.drain(this.topic, (message, done) => {
            super.emit("message", message);
            done();
        });
    }

    setupProducer(produceTopic, partitions = 1, readyCallback = null, kafkaErrorCallback = null){

        this.produceTopic = produceTopic || this.produceTopic;
        const {zkConStr, logger, clientName, options} = this.config;

        //might be possible if the parent stream is build to produce messages only
        if(!this.kafkaClient){
            this.kafkaClient = new Kafka(zkConStr, logger);
            this.kafkaClient.on("ready", readyCallback || NOOP);
            this.kafkaClient.on("error", kafkaErrorCallback || NOOP);
        }

        this.kafkaClient.becomeProducer([this.produceTopic], clientName, options);
        this.producer = new Publisher(this.kafkaClient, partitions || 1);
    }

    send(topic, message){

        if(!this.producer){
            throw new Error("producer is not yet setup.");
        }

        this.producer.send(topic,
            Array.isArray(message) ? message : [message],
            null,
            0,
            0
        );
    }

    pause(){
        if(this.kafkaClient){
            this.kafkaClient.pause();
        }
    }

    resume(){
        if(this.kafkaClient){
            this.kafkaClient.resume();
        }
    }

    close(commit = false){

        if(this.kafkaClient){
            return this.kafkaClient.close(commit);
        }

        return null;
    }
}

module.exports = KafkaClient;