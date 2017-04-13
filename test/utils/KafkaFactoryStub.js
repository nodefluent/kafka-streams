"use strict";

const FakeKafka = require("./FakeKafka.js");

class KafkaFactoryStub {

    constructor(){

        //SINGLETON
        if(KafkaFactoryStub.instance){
            return KafkaFactoryStub.instance;
        }

        this.lastProducer = null;
        this.lastConsumer = null;

        KafkaFactoryStub.instance = this;
        return this;
    }

    getKafkaClient(topic){
        console.log("KafkaFactoryStub creating KafkaClient for " + topic);
        const kafka = new FakeKafka(topic);
        this.lastConsumer = kafka;
        this.lastProducer = kafka;
        return kafka;
    }
}

module.exports = {KafkaFactoryStub};