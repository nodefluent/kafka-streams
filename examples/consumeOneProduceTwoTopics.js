"use strict";

const { KafkaStreams } = require("./../index.js");
const { nativeConfig: config } = require("./../test/test-config.js");

const kafkaStreams = new KafkaStreams(config);
const stream$ = kafkaStreams.getKStream("input-topic");

kafkaStreams.on("error", (error) => {
    console.log("Error occured:", error.message);
});

const [one$, two$] = stream$
    .branch([() => true, () => true]);

const producerPromiseOne = one$
    .mapJSONConvenience()
    .mapWrapKafkaValue()
    .tap((msg) => console.log("one", msg))
    .wrapAsKafkaValue()
    .to("output-topic-1", 1, "buffer");

const producerPromiseTwo = two$
    .mapJSONConvenience()
    .mapWrapKafkaValue()
    .tap((msg) => console.log("two", msg))
    .wrapAsKafkaValue()
    .to("output-topic-2", 1, "buffer");

Promise.all([
    producerPromiseOne,
    producerPromiseTwo,
    stream$.start(),
]).then(() => {
    console.log("Stream started, as kafka consumer and producers are ready.");
}, (error) => {
    console.log("Streaming operation failed to start: ", error);
});
