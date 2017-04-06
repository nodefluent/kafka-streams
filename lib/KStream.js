"use strict";

const KTable = require("./KTable.js");
const StreamAction = require("./StreamAction.js");
const StreamCount = require("./actions/StreamCount.js");

class KStream {

    constructor(topicName) {
        this.topicName = topicName;
        this.table = null;
        this.streamActions = [];
    }

    getTable(name){

        if(this.table === null){
            this.table = new KTable(name, this);
        }

        return this.table;
    }

    /* stream actions */

    flatMapValues(etl){
        this.streamActions.push(new StreamAction("flatMapValues", etl));
        return this;
    }

    map(etl){
        this.streamActions.push(new StreamAction("map", etl));
        return this;
    }

    /* table produce actions */

    countByKey(name){
        //TODO next -> get this to produce later when stream is read by kafkastreams.start()
        //TODO let this work with KTable and StreamCount (state)
        return this.getTable(name);
    }
}

module.exports = KStream;