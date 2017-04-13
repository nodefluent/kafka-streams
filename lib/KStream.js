"use strict";

const StreamDSL = require("./StreamDSL.js");

class KStream extends StreamDSL {

    constructor(topicName, storage = null, kafka = null) {
        super(topicName, storage, kafka);

        this.started = false;
    }

    /**
     * start kafka consumption
     * prepare production of messages if necessary
     * @param kafkaReadyCallback
     * @param kafkaErrorCallback
     */
    start(kafkaReadyCallback = null, kafkaErrorCallback = null){

        if(this.started){
            throw new Error("this KStream is already started.");
        }

        this.started = true;

        let producerReady = false;
        let consumerReady = false;

        const onReady = (type) => {
            switch(type){
                case "producer": producerReady = true; break;
                case "consumer": consumerReady = true; break;
            }

            //consumer && producer
            if(producerReady && consumerReady && kafkaReadyCallback){
                kafkaReadyCallback();
            }

            //consumer only
            if(!this.produceAsTopic && consumerReady && kafkaReadyCallback){
                kafkaReadyCallback();
            }

            //producer only
            if(this.produceAsTopic && producerReady && kafkaReadyCallback && !this.kafka.topic){
                kafkaReadyCallback();
            }
        };

        this.kafka.on("message", msg => super.writeToStream(msg));

        if(this.produceAsTopic){
            this.kafka.setupProducer(this.outputTopicName, this.outputPartitionsCount, () => { onReady("producer"); }, kafkaErrorCallback);
            super.forEach(message => this.kafka.send(this.outputTopicName, message));
        }

        this.kafka.start(() => { onReady("consumer"); }, kafkaErrorCallback);
    }

    /**
     * Emits an output when both input sources have records with the same key.
     * @param stream
     * @param key
     */
    innerJoin(stream, key = "key"){
        //TODO
    }

    /**
     * Emits an output for each record in either input source.
     * If only one source contains a key, the other is null
     * @param stream
     */
    outerJoin(stream){
        //TODO
    }

    /**
     * Emits an output for each record in the left or primary input source.
     * If the other source does not have a value for a given key, it is set to null
     * @param stream
     */
    leftJoin(stream){
        //TODO
    }

    /**
     * Emits an output for each record in any of the streams.
     * Acts as simple merge of both streams.
     * @param stream
     */
    chain(stream){

        if(!(stream instanceof KStream)){
            throw new Error("stream has to be an instance of KStream.");
        }

        this.merge(stream.stream$);
        return this;
    }

    close(){
        this.kafka.close();
    }
}

module.exports = KStream;