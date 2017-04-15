"use strict";

const EventEmitter = require("events");
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
    }

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

    setupProducer(produceTopic, partitions = 1, readyCallback = null, kafkaErrorCallback = null){

        this.produceTopic = produceTopic || this.produceTopic;
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

    send(topic, message){

        if(!this.producer){
            return Promise.reject("producer is not yet setup.");
        }

        return this.producer.send(topic,
            Array.isArray(message) ? message : [message],
            null,
            0,
            0
        );
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

        if(this.kafkaConsumerClient){
            this.kafkaConsumerClient.close(commit);
        }

        if(this.kafkaProducerClient){
            this.kafkaProducerClient.close();
        }
    }
}

module.exports = KafkaClient;