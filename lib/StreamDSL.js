"use strict";

const KStreamBase = require("./KStreamBase.js");
const KStorage = require("./KStorage.js");
const {KeyCount} = require("./actions");

const most = require("most");

class StreamDSL {

    constructor(topicName, storage = null) {

        if(!topicName || typeof topicName !== "string"){
            throw new Error("topicName must be a valid string.");
        }

        this.topicName = topicName;

        this.storage = storage || new KStorage();

        if(!(this.storage instanceof KStorage)){
            throw new Error("storage must be an intance of KStorage.");
        }

        this.table = null;
        this.base = new KStreamBase();
        this.$stream = most.fromEvent("message", this.base);

        this.produceAsTopic = false;
        this.outputTopicName = null;
    }

    /**
     * simple synchronous map function
     * etl = v -> v2
     * @param etl
     * @returns {StreamDSL}
     */
    map(etl){
        this.$stream = this.$stream.map(etl);
        return this;
    }

    /**
     * map that expects etl to return a Promise
     * can be used to apply async maps to stream
     * etl = v -> Promise
     * @param etl
     * @returns {StreamDSL}
     */
    asyncMap(etl){
        this.$stream = this.$stream.flatMap(value => most.fromPromise(etl(value)));
        return this;
    }

    /**
     * (can be used to apply side effects)
     * may not be used to chain
     * eff = v -> void
     * @param eff
     * @returns Promise{*}
     */
    forEach(eff){
        return this.$stream.forEach(eff);
    }

    /**
     * stream contains only events for which predicate
     * returns true
     * pred = v -> boolean
     * @param pred
     * @returns {StreamDSL}
     */
    filter(pred){
        this.$stream = this.$stream.filter(pred);
        return this;
    }

    /**
     * will remove duplicate messages
     * be aware that this might take a lot of memory
     * @returns {StreamDSL}
     */
    skipRepeats(){
        this.$stream = this.$stream.skipRepeats();
        return this;
    }

    /**
     * skips repeats per your definition
     * equals = (a,b) -> boolean
     * @param equals
     * @returns {StreamDSL}
     */
    skipRepeatsWith(equals){
        this.$stream = this.$stream.skipRepeatsWith(equals);
        return this;
    }

    /**
     * skips the amount of messages
     * @param count
     * @returns {StreamDSL}
     */
    skip(count){
        this.$stream = this.$stream.skip(count);
        return this;
    }

    /**
     * maps into counts per key
     * requires events to have a present key field
     * @param key
     * @param name
     * @returns {StreamDSL}
     */
    countByKey(key = "key", name = "Counts"){
        const keyCount = new KeyCount(this.storage, key);
        this.asyncMap(keyCount.execute.bind(keyCount));
        return this;
    }

    //TODO join, merge, zip
    //TODO more kafka-stream actions
    //TODO payload reader (default json payload) as map
    //TODO payload writer (default json payload) as map

    /**
     * define an output topic
     * when passed to KafkaStreams this will trigger
     * the $stream result to be produced to the given topic name
     * @param topic
     * @returns {StreamDSL}
     */
    to(topic){
        this.produceAsTopic = true;
        this.outputTopicName = topic;
        return this;
    }
}

module.exports = StreamDSL;