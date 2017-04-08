"use strict";

const StreamDSL = require("./StreamDSL.js");

class KStream extends StreamDSL {

    constructor(topicName, storage = null) {
        super(topicName, storage);
    }

}

module.exports = KStream;