"use strict";

//# https://github.com/apache/kafka/blob/0.10.0/streams/examples/src/main/java/org/apache/kafka/streams/examples/wordcount/WordCountDemo.java

const {KStream, KafkaStreams} = require("./../index.js");
const config = require("./../test/test-config.js");

function etl_ValueFlatten(value){
    return value.toLowerCase().split(" ");
}

function etl_KeyValueMapper(key, value){
    return {
        key,
        value
    };
}

const source = new KStream("streams-file-input");

//KTable
const counts = source
    .flatMapValues(etl_ValueFlatten)
        .map(etl_KeyValueMapper)
        .countByKey("Counts");

counts.to("streams-wordcount-output");

const streams = new KafkaStreams([source], config);
streams.start();

setTimeout(() => {
    streams.close();
}, 5000);