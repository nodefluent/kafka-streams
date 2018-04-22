"use strict";

//# aims to be similiar to this "official" word count example
//# https://github.com/apache/kafka/blob/0.10.0/streams/examples/src/main/java/org/apache/kafka/streams/examples/wordcount/WordCountDemo.java

/*
    the input topic could look like this:

    "fruit banana"
    "fruit cherry"
    "vegetable broccoli"
    "fruit strawberry"
    "vegetable lettuce"

    the output topic would then look like this:

    "fruit 3"
*/

const {KafkaStreams} = require("./../index.js");
const {nativeConfig: config} = require("./../test/test-config.js");

const kafkaStreams = new KafkaStreams(config);
const stream = kafkaStreams.getKStream();

stream
    .from("my-input-topic")
    .map(keyValueMapperEtl)
    .countByKey("key", "count")
    .filter(kv => kv.count >= 3)
    .map(kv => kv.key + " " + kv.count)
    .tap(kv => console.log(kv))
    .to("my-output-topic");

stream.start();

//consume & produce for 5 seconds
setTimeout(kafkaStreams.closeAll.bind(kafkaStreams), 5000);

function keyValueMapperEtl(message){
    const elements = message.toLowerCase().split(" ");
    return {
        key: elements[0],
        value: elements[1]
    };
}

//# alternatively checkout ../test/unit/WordCount.test.js for a working example without kafka broker
