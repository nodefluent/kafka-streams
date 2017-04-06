"use strict";

class KTable {

    constructor(name, streamReference){
        this.name = name;
        this.streamReference = streamReference;
        this.outputTopicName = name;
    }

    to(topic){
        this.outputTopicName = topic;
    }
}

module.exports = KTable;