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

    (yet for the sake of this example, there is a second stream that is used to produce
    to the topic)
*/

const { KafkaStreams } = require("./../index.js");
const { nativeConfig: config } = require("./../test/test-config.js");

const keyMapperEtl = (kafkaMessage) => {
    const value = kafkaMessage.value.toString("utf8");
    const elements = value.toLowerCase().split(" ");
    return {
        someField: elements[0],
    };
};

const kafkaStreams = new KafkaStreams(config);
const stream = kafkaStreams.getKStream();

stream
    .from("my-input-topic")
    .map(keyMapperEtl)
    .countByKey("someField", "count")
    .filter(kv => kv.count >= 3)
    .map(kv => kv.someField + " " + kv.count)
    .tap(kv => console.log(kv))
    .to("my-output-topic");

const inputStream = kafkaStreams.getKStream();
inputStream.to("my-input-topic");

const produceInterval = setInterval(() => {
    inputStream.writeToStream("kah vow");
}, 100);

Promise.all([
    stream.start(),
    inputStream.start()
]).then(() => {
    console.log("started..");
    // produce & consume for 5 seconds
    setTimeout(() => {
        clearInterval(produceInterval);
        kafkaStreams.closeAll();
        console.log("stopped..");
    }, 5000);
});

//# alternatively checkout ../test/unit/WordCount.test.js for a working example without kafka broker
