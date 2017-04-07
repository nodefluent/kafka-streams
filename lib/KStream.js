"use strict";

const KTable = require("./KTable.js");
const KStreamBase = require("./KStreamBase.js");
const KStorage = require("./KStorage.js");
const {KeyCount} = require("./actions");

const most = require("most");

class KStream {

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
    }

    getTable(name){

        if(this.table === null){
            this.table = new KTable(name, this);
        }

        return this.table;
    }

    /**
     * simple synchronous map function
     * etl = v -> v2
     * @param etl
     * @returns {KStream}
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
     * @returns {KStream}
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
     * @returns {KStream}
     */
    filter(pred){
        this.$stream = this.$stream.filter(pred);
        return this;
    }

    /**
     * will remove duplicate messages
     * be aware that this might take a lot of memory
     * @returns {KStream}
     */
    skipRepeats(){
        this.$stream = this.$stream.skipRepeats();
        return this;
    }

    /**
     * skips repeats per your definition
     * equals = (a,b) -> boolean
     * @param equals
     * @returns {KStream}
     */
    skipRepeatsWith(equals){
        this.$stream = this.$stream.skipRepeatsWith(equals);
        return this;
    }

    /**
     * skips the amount of messages
     * @param count
     * @returns {KStream}
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
     * @returns KTable{*}
     */
    countByKey(key = "key", name = "Counts"){
        const keyCount = new KeyCount(this.storage, key);
        this.asyncMap(keyCount.execute.bind(keyCount));
        return this.getTable(name);
    }

    //TODO join, merge, zip
    //TODO more kafka-stream actions
    //TODO payload reader (default json payload) as map
    //TODO payload writer (default json payload) as map
}

module.exports = KStream;