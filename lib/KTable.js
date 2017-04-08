"use strict";

const EventEmitter = require("events");
const most = require("most");

const StreamDSL = require("./StreamDSL.js");
const {LastState} = require("./actions");
const KStream = require("./KStream.js");

const REPLAY_MESSAGE = "replay-message";

class KTable extends StreamDSL {

    /**
     * gives a table representation of a stream
     * keyMapETL = v -> {key, value} (sync)
     * @param topicName
     * @param keyMapETL
     * @param storage
     */
    constructor(topicName, keyMapETL, storage = null){
        super(topicName, storage);
        this.ee = new EventEmitter();

        //KTable only works on {key, value} payloads
        if(typeof keyMapETL !== "function"){
            throw new Error("keyMapETL must be a valid function.");
        }

        this.map(keyMapETL);
        this.$table = most.empty();
    }

    finalise(){
        // a KStream is a simple changelog implementation (which StreamDSL delivers by default)
        // a KTable is a table stream representation meaning that only the latest representation of
        // a message must be present

        const lastState = new LastState(this.storage);
        this.asyncMap(lastState.execute.bind(lastState));

        this.$table = most.fromEvent(REPLAY_MESSAGE, this.ee); //replace stream

        this.ee.emit("finalise");
    }

    consumeUntilMs(ms = 1000){
        /*
        const signal = new EventEmitter();
        this.$stream = this.$stream.until(most.fromEvent("signal", signal));
        this.ee.on("finalise", () => {
            setTimeout(() => {
                signal.emit("signal");
            }, ms);
        });
        return this; */
        //TODO
    }

    consumeUntilCount(count = 1000){
        this.$stream = this.$stream.take(count);
        return this;
    }

    consumeUntilLatestOffset(){
        //TODO
    }

    getTable(){
        return this.storage.state;
    }

    replay(){
        Object.keys(this.storage.state).forEach(key => {
            this.ee.emit(REPLAY_MESSAGE, {
                key: key,
                value: this.storage.state[key]
            })
        });
    }

    getStream(){
        const kstream = new KStream(this.topicName, this.storage);
        kstream.$stream = this.$table;
        return kstream;
    }
}

module.exports = KTable;