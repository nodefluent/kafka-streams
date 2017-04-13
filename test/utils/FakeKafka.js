"use strict";

const KafkaClient = require("./../../lib/KafkaClient.js");

class FakeKafka extends KafkaClient {

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

    send(topic, message, cb){
        this._send([message], cb);
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