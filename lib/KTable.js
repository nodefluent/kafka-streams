"use strict";

class KTable {

    constructor(name){
        this.name = name;

        this.produceAsTopic = false;
        this.outputTopicName = name;
    }

    to(topic){
        this.produceAsTopic = true;
        this.outputTopicName = topic;
        return this;
    }
}

module.exports = KTable;