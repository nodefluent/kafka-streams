"use strict";

const EventEmitter = require("events");

class FakeKafka extends EventEmitter {

    constructor(topic){
        super();
        this.topic = topic;
        this.producedMessages = [];
    }

    fakeIncomingMessages(messages = []){
        messages.forEach(message => {
            this.emit("message", message);
        });
    }

    //produce
    send(payloads, cb){
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