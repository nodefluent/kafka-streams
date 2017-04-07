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

    getProducer(topic){
        const kafka = new FakeKafka(topic);
        this.lastProducer = kafka;
        return kafka;
    }

    getConsumer(topic){
        const kafka = new FakeKafka(topic);
        this.lastConsumer = kafka;
        return kafka;
    }
}

module.exports = {KafkaFactoryStub};