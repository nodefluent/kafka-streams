"use strict";

const EventEmitter = require("events");
const most = require("most");

const KStorage = require("./KStorage.js");
const KafkaClient =  require("./KafkaClient.js");
const {KeyCount, Sum} = require("./actions");

class StreamDSL {

    constructor(topicName, storage = null, kafka = null) {

        if(!kafka || !(kafka instanceof KafkaClient)){
            throw new Error("kafka has to be an instance of KafkaClient.");
        }

        if(!storage || !(storage instanceof KStorage)){
            throw new Error("storage hsa to be an instance of KStorage.");
        }

        this.topicName = topicName || ""; //empty topic name is allowed for produce only streams

        this.kafka = kafka;
        this.storage = storage;

        if(!(this.storage instanceof KStorage)){
            throw new Error("storage must be an intance of KStorage.");
        }

        this._ee = new EventEmitter();
        this.stream$ = most.fromEvent("message", this._ee);

        this.produceAsTopic = false;
        this.outputTopicName = null;
        this.outputPartitionsCount = 1;
    }

    /**
     * can be used to manually write message/events
     * to the internal stream$
     * @param message
     */
    writeToStream(message){
        this._ee.emit("message", message);
    }

    /*
     *   #           #
     *  ##           ##
     * ###    DSL    ###
     *  ##           ##
     *   #           #
     */

    /**
     * simple synchronous map function
     * etl = v -> v2
     * @param etl
     * @returns {StreamDSL}
     */
    map(etl){
        this.stream$ = this.stream$.map(etl);
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
        this.stream$ = this.stream$.flatMap(value => most.fromPromise(etl(value)));
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
        return this.stream$.forEach(eff);
    }

    /**
     * same as forEach but will enable you
     * to call it in a chain
     * @param eff
     * @param errorCallback
     * @returns {StreamDSL}
     */
    chainForEach(eff, errorCallback = null){

        this.stream$.forEach(eff).catch(e => {
            if(errorCallback){
                errorCallback(e);
            }
        });

        return this;
    }

    /**
     * stream contains only events for which predicate
     * returns true
     * pred = v -> boolean
     * @param pred
     * @returns {StreamDSL}
     */
    filter(pred){
        this.stream$ = this.stream$.filter(pred);
        return this;
    }

    /**
     * will remove duplicate messages
     * be aware that this might take a lot of memory
     * @returns {StreamDSL}
     */
    skipRepeats(){
        this.stream$ = this.stream$.skipRepeats();
        return this;
    }

    /**
     * skips repeats per your definition
     * equals = (a,b) -> boolean
     * @param equals
     * @returns {StreamDSL}
     */
    skipRepeatsWith(equals){
        this.stream$ = this.stream$.skipRepeatsWith(equals);
        return this;
    }

    /**
     * skips the amount of messages
     * @param count
     * @returns {StreamDSL}
     */
    skip(count){
        this.stream$ = this.stream$.skip(count);
        return this;
    }

    /**
     * takes the first messages until count
     * and omits the rest
     * @param count
     * @returns {StreamDSL}
     */
    take(count){
        this.stream$ = this.stream$.take(count);
        return this;
    }

    /**
     * easy string to array mapping
     * you can pass your delimiter
     * default is space
     * "bla blup" => ["bla", "blup"]
     * @param delimiter
     * @returns {StreamDSL}
     */
    mapStringToArray(delimiter = " "){

        this.stream$ = this.stream$.map(element => {

            if(!element || typeof element !== "string"){
                return element;
            }

            return element.split(delimiter);
        });

        return this;
    }

    /**
     * easy array to key-value object mapping
     * you can pass your own indices
     * default is 0,1
     * ["bla", "blup"] => { key: "bla", value: "blup" }
     * @param keyIndex
     * @param valueIndex
     * @returns {StreamDSL}
     */
    mapArrayToKV(keyIndex = 0, valueIndex = 1){

        this.stream$ = this.stream$.map(element => {

            if(!Array.isArray(element)){
                return element;
            }

            return {
                key: element[keyIndex],
                value: element[valueIndex]
            }
        });

        return this;
    }

    /**
     * easy string to key-value object mapping
     * you can pass your own delimiter and indices
     * default is " " and 0,1
     * "bla blup" => { key: "bla", value: "blup" }
     * @param delimiter
     * @param keyIndex
     * @param valueIndex
     * @returns {StreamDSL}
     */
    mapStringToKV(delimiter = " ", keyIndex = 0, valueIndex = 1){
        this.mapStringToArray(delimiter);
        this.mapArrayToKV(keyIndex, valueIndex);
        return this;
    }

    /**
     * maps every stream event through JSON.parse
     * if its type is an object
     * (if parsing fails, the error object will be returned)
     * @returns {StreamDSL}
     */
    mapParse(){

        this.stream$ = this.stream$.map(string => {

            if(typeof string !== "string"){
                return string;
            }

            try {
                return JSON.parse(string);
            } catch(e){
                return e;
            }
        });

        return this;
    }

    /**
     * maps every stream event through JSON.stringify
     * if its type is object
     * @returns {StreamDSL}
     */
    mapStringify(){

        this.stream$ = this.stream$.map(object => {

            if(typeof object !== "object"){
                return object;
            }

            return JSON.stringify(object);
        });

        return this;
    }

    /**
     * maps every stream event's kafka message
     * right to its payload value
     * @returns {StreamDSL}
     */
    mapWrapKafkaPayload(){

        this.stream$ = this.stream$.map(message => {

            if(typeof message === "object" &&
                typeof message.value !== "undefined"){
                return message.value;
            }

            return message;
        });

        return this;
    }

    //TODO payload reader (default json payload) as map
    //TODO payload writer (default json payload) as map

    /*
     *   #           #
     *  ##           ##
     * ### AGGREGATE ###
     *  ##           ##
     *   #           #
     */

    /**
     * maps into counts per key
     * requires events to have a present key/value field
     * @param key
     * @param countFieldName
     * @returns {StreamDSL}
     */
    countByKey(key = "key", countFieldName = "count"){
        const keyCount = new KeyCount(this.storage, key, countFieldName);
        this.asyncMap(keyCount.execute.bind(keyCount));
        return this;
    }

    /**
     * maps into sums per key
     * requires events to have a present key/value field
     * @param key
     * @param fieldName
     * @param sumField
     * @returns {StreamDSL}
     */
    sumByKey(key = "key", fieldName = "value", sumField = false){
        const sum = new Sum(this.storage, key, fieldName, sumField);
        this.asyncMap(sum.execute.bind(sum));
        return this;
    }

    //TODO more kafka-stream actions

    /*
     *   #           #
     *  ##           ##
     * ###   JOINS   ###
     *  ##           ##
     *   #           #
     */

    /**
     * use this as base of a higher-order stream
     * and merge all child streams into a new stream
     * @private
     */
    join(){
        this.stream$ = most.join(this.stream$);
    }

    /**
     * merge this stream with another, resulting a
     * stream with all elements from both streams
     * @param otherStream$
     */
    merge(otherStream$){
        this.stream$ = most.merge(this.stream$, otherStream$);
    }

    /**
     * merge this stream with another stream
     * by combining (zipping) every event from each stream
     * to a single new event on the new stream
     * combine = (e1, e2) -> e1 + e2
     * @param otherStream$
     * @param combine
     */
    zip(otherStream$, combine){
        this.stream$ = this.stream$.zip(combine, otherStream$);
    }

    /*
     *   #           #
     *  ##           ##
     * ###  OUTPUT   ###
     *  ##           ##
     *   #           #
     */

    /**
     * define an output topic
     * when passed to KafkaStreams this will trigger
     * the stream$ result to be produced to the given topic name
     * @param topic
     * @param outputPartitionsCount
     * @returns {StreamDSL}
     */
    to(topic, outputPartitionsCount = 1){
        this.produceAsTopic = true;
        this.outputTopicName = topic;
        this.outputPartitionsCount = outputPartitionsCount;
        return this;
    }
}

module.exports = StreamDSL;