"use strict";

const most = require("most");
const {create} = require("@most/create");

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
     */
    constructor(topicName, keyMapETL, storage = null){
        super(topicName, storage);

        //KTable only works on {key, value} payloads
        if(typeof keyMapETL !== "function"){
            throw new Error("keyMapETL must be a valid function.");
        }

        this.table$ = create((add, end, error) => {
            this._tableAdd = add; //TODO re-scoping these is unsupported
            this._tableEnd = end;
            this._tableError = error;
            return () => {}; //disposal
        });
        this.table$.forEach(_ => {}); //creating demand for the stream to trigger publish function

        this.map(keyMapETL);
    }

    writeToTableStream(message){
        if(this._tableAdd){
            this._tableAdd(message);
        }
    }

    finalise(){
        // a KStream is a simple changelog implementation (which StreamDSL delivers by default)
        // a KTable is a table stream representation meaning that only the latest representation of
        // a message must be present

        const lastState = new LastState(this.storage);
        this.asyncMap(lastState.execute.bind(lastState));
        this.stream$ = this.stream$.merge(this.table$);
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
}

module.exports = KTable;