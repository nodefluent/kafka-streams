"use strict";

const Promise = require("bluebird");
const JSKafkaClient = require("../../lib/client/JSKafkaClient.js");

class FakeKafka extends JSKafkaClient {

    constructor(topic, config = {}){
        super(topic, config);
        this.topic = topic;
        this.producedMessages = [];
    }

    fakeIncomingMessages(messages = []){
        messages.forEach(message => {
            super.emit("message", message);
        });
    }

    start(readyCallback = null){

        if(!this.topic){
            return;
        }

        process.nextTick(() => {
            if(readyCallback){
                readyCallback();
            }
        });
    }

    setupProducer(produceTopic, partitions = 1, readyCallback = null, kafkaErrorCallback = null){

        process.nextTick(() => {
            if(readyCallback){
                readyCallback();
            }
        });
    }

    send(topic, message){
        return new Promise(resolve => this._send([message], resolve));
    }

    //produce
    _send(payloads, cb){
        payloads.forEach(payload => this.producedMessages.push(payload));
        if(cb){
            cb();
        }
    }

    close(){
        this.producedMessages = [];
    }
}

module.exports = FakeKafka;
