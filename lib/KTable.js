"use strict";

const EventEmitter = require("events");
const most = require("most");
const {create} = require("@most/create");
const Promise = require("bluebird");

const StreamDSL = require("./StreamDSL.js");
const {LastState} = require("./actions");
const KStream = require("./KStream.js");

class KTable extends StreamDSL {

    /**
     * gives a table representation of a stream
     * keyMapETL = v -> {key, value} (sync)
     * @param topicName
     * @param keyMapETL
     * @param storage
     * @param kafka
     */
    constructor(topicName, keyMapETL, storage = null, kafka = null){
        super(topicName, storage, kafka);

        //KTable only works on {key, value} payloads
        if(typeof keyMapETL !== "function"){
            throw new Error("keyMapETL must be a valid function.");
        }

        this._tee = new EventEmitter();
        this.table$ = most.fromEvent("message", this._tee);
        this.started = false;

        this.map(keyMapETL);
    }

    /**
     * start kafka consumption
     * prepare production of messages if necessary
     * when called with zero or just a single callback argument
     * this function will return a promise and use the callback for errors
     * @param kafkaReadyCallback
     * @param kafkaErrorCallback
     */
    start(kafkaReadyCallback = null, kafkaErrorCallback = null){

        if(arguments.length < 2){
            return new Promise(resolve => {
                this._start(resolve, kafkaErrorCallback);
            });
        }

        return this._start(kafkaReadyCallback, kafkaErrorCallback);
    }

    _start(kafkaReadyCallback = null, kafkaErrorCallback = null){

        if(this.started){
            throw new Error("this KTable is already started.");
        }

        this.started = true;

        if(!this.topicName && !this.produceAsTopic){
            return kafkaReadyCallback(); //possibly a good idea to skip finalise()
        }

        this.finalise();

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
        this.kafka.start(() => { onReady("consumer"); }, kafkaErrorCallback, this.produceAsTopic);

        if(this.produceAsTopic){
            this.kafka.setupProducer(this.outputTopicName, this.outputPartitionsCount, () => { onReady("producer"); },
                kafkaErrorCallback);
            super.forEach(message => this.kafka.send(this.outputTopicName, message));
        }
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

    merge(){
        //TODO
    }

    writeToTableStream(message){
        this._tee.emit("message", message);
    }

    finalise(){
        // a KStream is a simple changelog implementation (which StreamDSL delivers by default)
        // a KTable is a table stream representation meaning that only the latest representation of
        // a message must be present

        const lastState = new LastState(this.storage);
        this.asyncMap(lastState.execute.bind(lastState));
        this._merge(this.table$);
    }

    consumeUntilMs(ms = 1000){

        const signal = create((add, end, _) => {
            setTimeout(() => {
                add("signal");
                end();
            }, ms);
            return () => {};
        });

        this.stream$ = this.stream$.until(signal);

        return this;
    }

    consumeUntilCount(count = 1000){
        this.stream$ = this.stream$.take(count);
        return this;
    }

    consumeUntilLatestOffset(){
        //TODO
    }

    getTable(){
        return this.storage.state || {};
    }

    replay(){
        Object.keys(this.storage.state).forEach(key => {

            const message = {
                key: key,
                value: this.storage.state[key]
            };

            this.writeToTableStream(message);
        });
    }

    close(){
        this.kafka.close();
    }
}

module.exports = KTable;