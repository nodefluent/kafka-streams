"use strict";

const {KafkaStreams} = require("./../index.js");
const {nativeConfig: config} = require("./../test/test-config.js");

const kafkaStreams = new KafkaStreams(config);

const stream1 = kafkaStreams.getKStream("my-input-topic-1");
const stream2 = kafkaStreams.getKStream("my-input-topic-2");
const stream3 = kafkaStreams.getKStream("my-input-topic-3");

//merge will make sure any message that is consumed on any of the streams
//will end up being emitted in the merged stream
//checkout other operations: join (outer, left, inner), combine, zip
//for other merge options
const mergedStream = stream1.merge(stream2).merge(stream3);

mergedStream
    .filter(v => !!v); //you can use this stream as usual

//await for 3 kafka consumer
//and 1 kafka producer to be ready
Promise.all([
    stream1.start(),
    stream2.start(),
    stream3.start(),
    mergedStream.to("my-merged-output-topic") //BE AWARE that .to()s on a merged stream are async
]).then(_ => {
    //consume and produce for 5 seconds
    setTimeout(kafkaStreams.closeAll.bind(kafkaStreams), 5000);
});
