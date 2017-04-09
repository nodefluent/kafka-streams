"use strict";

const KStorage = require("./KStorage.js");
const {KeyCount, Sum} = require("./actions");

const most = require("most");
const {create} = require("@most/create");

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

        this.stream$ = create((add, end, error) => {
            this._baseAdd = add; //TODO re-scoping these is unsupported
            this._baseEnd = end;
            this._baseError = error;
            return () => {}; //disposal
        });

        this.produceAsTopic = false;
        this.outputTopicName = null;
    }

    /**
     * can be used to manually write message/events
     * to the internal stream$
     * @param message
     */
    writeToStream(message){
        if(this._baseAdd){
            this._baseAdd(message);
        }
    }

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
        this.asyncMap(sum.execute.bind(sum)); //TODO mapping these to a whole promise chain will cause buggy results
        return this;
    }

    //TODO join, merge, zip
    //TODO more kafka-stream actions
    //TODO payload reader (default json payload) as map
    //TODO payload writer (default json payload) as map

    /**
     * define an output topic
     * when passed to KafkaStreams this will trigger
     * the stream$ result to be produced to the given topic name
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