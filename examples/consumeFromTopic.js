"use strict";

const { KafkaStreams } = require("./../index.js");
const { nativeConfig: config } = require("./../test/test-config.js");

const kafkaStreams = new KafkaStreams(config);
const stream = kafkaStreams.getKStream("my-input-topic");

//adding a side effect call to the stream via tap
stream.forEach(message => {
    console.log(message);
});

//start the stream
//(wait for the kafka consumer to be ready)
stream.start().then(_ => {
    //wait a few ms and close all connections
    setTimeout(kafkaStreams.closeAll.bind(kafkaStreams), 100);
});
