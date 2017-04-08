"use strict";

const KafkaFactory = require("./KafkaFactory.js");
const KStream = require("./KStream.js");
const KTable = require("./KTable.js");

class KafkaStreams {

    constructor(stream, config){

        if(!(stream instanceof KStream) && !(stream instanceof KTable)){
            throw new Error("stream must be an instance of KStream or KTable.");
        }

        this.stream = stream;
        this.config = config;

        this.factory = new KafkaFactory(config);

        this.consumer = null;
        this.producer = null;
    }

    start(){

        if(this.stream instanceof KTable){
            this.stream.finalise();
        }

        this.consumer = this.factory.getConsumer(this.stream.topicName);
        this.consumer.on("message", msg => this.stream.writeToStream(msg));

        if(this.stream.produceAsTopic){
            this.producer = this.factory.getProducer(this.stream.outputTopicName);
            this.stream.forEach(message => this.producer.send([message]));
        }
    }

    close(){
        this.consumer.close();
        this.producer.close();
    }
}

module.exports = KafkaStreams;