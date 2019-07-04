"use strict";

const { KafkaStreams } = require("./../index.js");
const { nativeConfig: config } = require("./../test/test-config.js");

const kafkaStreams = new KafkaStreams(config);

kafkaStreams.on("error", (error) => {
    console.log("Error occured:", error.message);
});

const stream = kafkaStreams.getKStream(null);
//creating a stream without topic is possible
//no consumer will be created during stream.start()

// 2nd arg is the output partition count, if you do not provide a partition the messages are automatically split across based on key or randomly
// 3nd arg is the produce type of the sinek library, suggestion: stick to "send" this leaves all design options for you
stream
    .tap(console.log) // lets log some stream events
    .to("default-target-topic", 1, "send");
//define a topic to stream messages to, if nothing is actually defined in the kv structure

//start the stream
//(wait for the kafka producer to be ready, same as await .to())
//and write a few messages to the topic stream.start()
stream.start().then((_) => {

    stream.writeToStream(getKafkaStyledMessage({ ping: "pong" })); // will be produced to default-target-topic
    stream.writeToStream(getKafkaStyledMessage({ ping: "pong" }, "other-topic")); // will be produced to other-topic
    stream.writeToStream([
        getKafkaStyledMessage({ ping: "pong" }, "other-topic-2"),
        getKafkaStyledMessage({ ping: "pong" }, "other-topic-3")
    ]);

    //wait a few ms and close all connections
    setTimeout(kafkaStreams.closeAll.bind(kafkaStreams), 5000);
});

// its very important the events on your stream are shipped in a certain format
// if they are not in the required KV format they will be treated as message values and not as full kafka messages
function getKafkaStyledMessage(payload, topic = undefined, partition = undefined) {
    return {
        key: null, // (required) just to not be undefined, keys will otherwise receive random uuids
        value: JSON.stringify(payload), // required, ensure this is a string or a buffer!
        // optional:
        topic,
        partition,
    };
}
