"use strict";

const StreamDSL = require("./StreamDSL.js");

class KTable extends StreamDSL {

    /**
     * gives a table representation of a stream
     * keyMapETL = v -> {key, value} (sync)
     * @param topicName
     * @param keyMapETL
     * @param storage
     */
    constructor(topicName, keyMapETL, storage = null){
        super(topicname, storage);
        this._applyTablePreparations(keyMapETL);
    }

    _applyTablePreparations(etl){

        if(typeof etl !== "function"){
            throw new Error("keyMapETL must be a valid function.");
        }

        // a KStream is a simple changelog implementation (which StreamDSL delivers by default)
        // a KTable is a table stream representation meaning that only the latest representation of
        // a message must be present

        this.map(etl); //TODO implement this as cold observable to replay KTable
    }
}

module.exports = KTable;