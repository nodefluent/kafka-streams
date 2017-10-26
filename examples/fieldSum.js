"use strict";

const {KafkaStreams} = require("./../index.js");
const {nativeConfig: config} = require("./../test/test-config.js");

const kafkaStreams = new KafkaStreams(config);
const stream = kafkaStreams.getKStream("my-input-topic");

stream
    .mapStringToKV(" ", 0, 1) //string to key-value object; args: delimiter, key-index, value-index
    .sumByKey("key", "value", "sum")
    .map(kv => kv.key + " " + kv.sum)
    .tap(kv => console.log(kv))
    .to("my-output-topic");

stream.start();

//consume for 5 seconds
setTimeout(kafkaStreams.closeAll.bind(kafkaStreams), 5000);
