"use strict";

const { KafkaStreams } = require("./../index.js");
const { nativeConfig: config } = require("./../test/test-config.js");

const kafkaStreams = new KafkaStreams(config);
const stream = kafkaStreams.getKStream("my-input-topic");

kafkaStreams.on("error", (error) => {
    console.log("Error occured:", error.message);
});

//adding a side effect call to the stream via tap
stream.forEach((message) => {
    console.log("key", message.key ? message.key.toString("utf8") : null);
    console.log("value", message.value ? message.value.toString("utf8") : null);
    console.log("partition", message.partition);
    console.log("size", message.size);
    console.log("offset", message.offset);
    console.log("timestamp", message.timestamp);
    console.log("topic", message.topic);
});

//start the stream
//(wait for the kafka consumer to be ready)
stream.start().then(_ => {
    //wait a few ms and close all connections
    setTimeout(kafkaStreams.closeAll.bind(kafkaStreams), 5000);
});
