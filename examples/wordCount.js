"use strict";

//# https://github.com/apache/kafka/blob/0.10.0/streams/examples/src/main/java/org/apache/kafka/streams/examples/wordcount/WordCountDemo.java

const {KStream, KafkaStreams} = require("./../index.js");
const config = require("./../test/test-config.js");

function etl_ValueFlatten(value){
    return value.toLowerCase().split(" ");
}

function etl_KeyValueMapper(elements){
    return {
        key: elements[0],
        value: elements[1]
    };
}

const source = new KStream("streams-file-input");

source
    .map(etl_ValueFlatten)
    .map(etl_KeyValueMapper)
    .countByKey("key", "count")
    .to("streams-wordcount-output");

const streams = new KafkaStreams(source, config);
streams.start();

setTimeout(() => {
    streams.close();
}, 5000);

//# alternatively checkout ../test/unit/WordCount.test.js for a working example without kafka broker