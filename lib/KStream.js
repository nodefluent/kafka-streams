"use strict";

const StreamDSL = require("./StreamDSL.js");

class KStream extends StreamDSL {

    constructor(topicName, storage = null, kafka = null) {
        super(topicName, storage, kafka);

        this.started = false;
    }

    start(){

        if(this.started){
            throw new Error("this KTable is already started.");
        }

        this.started = true;

        this.kafka.on("message", msg => super.writeToStream(msg));

        if(this.produceAsTopic){
            super.forEach(message => this.kafka.send(this.outputTopicName, message));
        }

        this.kafka.start();
    }

    /**
     * Emits an output when both input sources have records with the same key.
     * @param stream
     */
    innerJoin(stream, key = "key"){

        const newKStream = new KStream("");

    }

    /**
     * Emits an output for each record in either input source.
     * If only one source contains a key, the other is null
     * @param stream
     */
    outerJoin(stream){

    }

    /**
     * Emits an output for each record in the left or primary input source.
     * If the other source does not have a value for a given key, it is set to null
     * @param stream
     */
    leftJoin(stream){

    }
}

module.exports = KStream;