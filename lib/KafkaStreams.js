"use strict";

const KafkaFactory = require("./KafkaFactory.js");
const KStream = require("./KStream.js");

class KafkaStreams {

    constructor(stream, config){

        if(!(stream instanceof KStream)){
            throw new Error("stream must be an instance of KStream.");
        }

        this.stream = stream;
        this.config = config;

        this.factory = new KafkaFactory(config);

        this.consumer = null;
        this.producer = null;
    }

    start(){
        this.consumer = this.factory.getConsumer(this.stream.topicName);
        this.consumer.on("message", msg => this.stream.base.append(msg));

        const table = this.stream.getTable();
        if(table.produceAsTopic){
            this.producer = this.factory.getProducer(table.outputTopicName);
            this.stream.forEach(message => this.producer.send([message]));
        }
    }

    close(){
        this.consumer.close();
        this.producer.close();
    }
}

module.exports = KafkaStreams;