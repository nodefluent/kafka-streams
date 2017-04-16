"use strict";

const EventEmitter = require("events");
const most = require("most");
const Promise = require("bluebird");

const KStorage = require("./KStorage.js");
const KafkaClient =  require("./KafkaClient.js");
const {KeyCount, Sum} = require("./actions");

const NOOP = () => {};
const MESSAGE = "message";

class StreamDSL {

    constructor(topicName, storage = null, kafka = null, isClone = false) {

        if(!isClone && (!kafka || !(kafka instanceof KafkaClient))){
            throw new Error("kafka has to be an instance of KafkaClient.");
        }

        if(!storage || !(storage instanceof KStorage)){
            throw new Error("storage hsa to be an instance of KStorage.");
        }

        this.topicName = topicName || ""; //empty topic name is allowed for produce only streams

        this.kafka = kafka;
        this.storage = storage;
        this.isClone = isClone;

        if(!(this.storage instanceof KStorage)){
            throw new Error("storage must be an instance of KStorage.");
        }

        this._ee = new EventEmitter();
        this.stream$ = most.fromEvent(MESSAGE, this._ee);

        this.produceAsTopic = false;
        this.outputTopicName = null;
        this.outputPartitionsCount = 1;
        this._kafkaStreams = null;
    }

    getStats(){
        return this.kafka ? this.kafka.getStats() : null
    }

    /**
     * can be used to manually write message/events
     * to the internal stream$
     * @param message
     */
    writeToStream(message){
        this._ee.emit("message", message);
    }

    /**
     * used to clone or during merges
     * resets the internal event emitter to the new stream
     * and replaces the internal stream with the merged new stream
     * @param newStream$
     */
    replaceInternalObservable(newStream$){
        this._ee.removeAllListeners(MESSAGE);
        this._ee = new EventEmitter();
        this.stream$ = most.merge(newStream$, most.fromEvent(MESSAGE, this._ee));
    }

    setKafkaStreamsReference(reference){
        this._kafkaStreams = reference;
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
     * use this for side-effects
     * errors in eff will break stream
     * @param eff
     */
    tap(eff){
        this.stream$ = this.stream$.tap(eff);
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

        return this.map(element => {

            if(!element || typeof element !== "string"){
                return element;
            }

            return element.split(delimiter);
        });
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

        return this.map(element => {

            if(!Array.isArray(element)){
                return element;
            }

            return {
                key: element[keyIndex],
                value: element[valueIndex]
            }
        });
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

        return this.map(string => {

            if(typeof string !== "string"){
                return string;
            }

            try {
                return JSON.parse(string);
            } catch(e){
                return e;
            }
        });
    }

    /**
     * maps every stream event through JSON.stringify
     * if its type is object
     * @returns {StreamDSL}
     */
    mapStringify(){

        return this.map(object => {

            if(typeof object !== "object"){
                return object;
            }

            return JSON.stringify(object);
        });
    }

    /**
     * maps every stream event's kafka message
     * right to its payload value
     * @returns {StreamDSL}
     */
    mapWrapKafkaPayload(){

       return this.map(message => {

            if(typeof message === "object" &&
                typeof message.value !== "undefined"){
                return message.value;
            }

            return message;
        });
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
    _join(){
        this.stream$ = most.join(this.stream$);
    }

    /**
     * merge this stream with another, resulting a
     * stream with all elements from both streams
     * @param otherStream$
     */
    _merge(otherStream$){
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
    _zip(otherStream$, combine){
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
     * if the instance is a clone, this function call will have to setup a kafka producer
     * returns a promise
     * @param topic
     * @param outputPartitionsCount
     * @param producerErrorCallback
     * @returns {Promise}
     */
    to(topic, outputPartitionsCount = 1, producerErrorCallback = null){
        return new Promise(resolve => {

            if(this.produceAsTopic){
                throw new Error(".to() has already been called on this dsl instance.");
            }

            this.produceAsTopic = true;
            this.outputTopicName = topic;
            this.outputPartitionsCount = outputPartitionsCount;

            if(!this.isClone){
                return resolve(true);
            }

            //this instance is a clone, meaning that it has been created
            //as the result of a KStream or KTable merge
            //which requires the creation of a Producer for .to() to work first

            if(!this.kafka || !this.kafka.setupProducer){
                throw new Error("setting .to() on a cloned KStream requires a kafka client to injected during merge.");
            }

            this.kafka.setupProducer(this.outputTopicName, this.outputPartitionsCount,
                resolve, producerErrorCallback || NOOP);

            this.forEach(message => {
                this.kafka.send(this.outputTopicName, message).catch(e => {
                    if(producerErrorCallback){
                        producerErrorCallback(e);
                    }
                });
            });
        });
    }
}

module.exports = StreamDSL;