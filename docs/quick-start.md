Quick Start Tutorial
====================

# Requirements

* Before you get started, make sure you have installed NodeJS (at least version 6.10, better latest)
running on your system and a local Zookeeper (:2181) and Kafka Broker (:9092) (if you are running
these services elsewhere, make sure to adapt the config settings)
* You can find the latest NodeJS version [here](https://nodejs.org/en/download/) (if you did not know already)
* When you are in need of a `local` kafka setup, just take a look at `/kafka-setup/start.sh` (you will need docker and docker-compose for this to work)
* Installing kafka-streams in an existing project (directory with package.json) is quite easy: `npm install --save kafka-streams`

# Configuration

* NOTE: as of version 3.0.0 node-kafka-streams supports an additional `librdkafka` client,
    that offers better performance, configuration tweaking and especially features like
    SASL and Kerberos [checkout the native docs](native.md) for more details.
    **We really want to encourage you to always use the native clients if possible.**

```es6
{
    //zkConStr: "localhost:2181/",
    kafkaHost: "localhost:9092", //either kafkaHost or zkConStr
    logger: {
      debug: msg => console.log(msg),
      info: msg => console.log(msg),
      warn: msg => console.log(msg),
      error: msg => console.error(msg)
    },
    groupId: "kafka-streams-test",
    clientName: "kafka-streams-test-name",
    workerPerPartition: 1,
    options: {
        sessionTimeout: 8000,
        protocol: ["roundrobin"],
        fromOffset: "earliest", //latest
        fetchMaxBytes: 1024 * 100,
        fetchMinBytes: 1,
        fetchMaxWaitMs: 10,
        heartbeatInterval: 250,
        retryMinTimeout: 250,
        autoCommit: true,
        autoCommitIntervalMs: 1000,
        requireAcks: 1,
        ackTimeoutMs: 100,
        partitionerType: 3
    }
}
```

* Config is a simple object that is being passed to the constructor of
KafkaStreams, which will result an a new Factory for KStreams and KTables on the
outside and KafkaClients and KStorages on the inside.

* The sub-object options supports all settings provided by the `kafka-node`
module.

# The API

```es6
const {KafkaStreams} = require("kafka-streams");
```

* Understanding the KafkaStreams object.
A KafkaStreams instance is the representation of a classical "factory", which will enable you to create
multiple instances of KStreams and KTables using the same configuration for KStorages and KafkaClients easily.
That is why you have to pass a config object to the constructor of KafkaStreams.

```es6
const kafkaStreams = new KafkaStreams(config);
```

* Creating a new KStream (change-log stream representation) via:

```es6
const kafkaTopicName = "my-topic";
const stream = kafkaStreams.getKStream(kafkaTopicName);
stream.forEach(message => console.log(message);
stream.start().then(() => {
    console.log("stream started, as kafka consumer is ready.");
}, error => {
    console.log("streamed failed to start: " + error);
});
```

* Using the factory as base, its simple to create new streams, you can pass a
topic name as string to `getKStream()` and calling `.start()` (which returns a Promise,
that will resolve when the Kafka Client is connected & ready to consume messages).

* Please Note: that you do not have to pass a topic to `getKStream()` anymore,
you can also simply call `stream.from("topicName")` later. (Also multiple times
to stream from multiple Kafka topics).

* We highly suggest to read the [Message Schemas to and from Kafka guide](handling-messages-schemas.md)

```es6
//format of an incoming kafka message (equals to kafka-node's format)
{
    topic: "",
    value: "",
    offset: 0,
    partition: 0,
    highWaterOffset: 6,
    key: -1
}
```

* When using `stream$.to("topic-name")` to stream the final events of your stream back to another
Kafka Topic, the use of `.start()` will also cause another Kafka Client to be created and connected
as producer, the promise will then resolve after both, the consumer and the producer have been connected
to the broker successfully.

* Keep in mind that messages which will be produced to Kafka via `.to()` will have to be in a string or
object format depending on the type: "send", "buffer", "bufferFormat" you pass. Per default the type will be
"send" which requires your events to be a string when reaching the end, using "buffer" or "bufferFormat" will require
your events to be objects when reaching the end of the stream.

```es6
const PRODUCE_TYPES = {
    SEND: "send",
    BUFFER: "buffer",
    BUFFER_FORMAT: "buffer_format"
};

.to(topic, outputPartitionsCount = 1, produceType = "send", version = 1, compressionType = 0, producerErrorCallback = null)
```

* You can always call `.getKStream()` without a topic parameter and there is no requirement to call
`.to(..)` on a stream - leaving you with an empty stream neither connected as consumer nor producer.

* Calling `.writeToStream(message)` will always enable to to add messages/events to a stream manually.

* By default your node app will keep running, as long as the Kafka Clients in your streams are still connected.
If you want to close a single stream and its clients, simply call `stream$.close()` if you want to close any Kafka Clients
related to streams created with a KafkaStreams instance, simply call `kafkaStreams.closeAll()`.

* You can apply any kind of stream operations to a KStream or KTable instance to get a better feeling of how they
can be combined you should take a look at the `/examples` folder.

* By default a KStream instance will always stay open, until you call a completing operation such as `.take()` or `.until()`. This is through the nature of most.js streams; which builds the base for any streaming operations, therefore the APIs are very similiar besides the fact that KSteams and KTables `DO NOT` return a new instance on every operation e.g. `stream$.filter(() => {})` (the internal most.js stream is indeed a new one, but the KStream or KTable instance stays the same) But for window and merge|join|combine operations, KStreams and KTables have to return a `NEW` instance.

```es6
const firstStream = kafkaStreams.getKStream("first-topic");
const secondStream = kafkaStreams.getKStream("second-topic");
const mergedStream = firstStream.merge(secondStream); //new KStream instance

Promise.all([
    firstStream.start(),
    secondStream.start(),
    mergedStream.to("merged-topic")
    ])
.then(() => {
    console.log("both consumers and the producer have connected.");
});
```
* Combining streams is simple, keep in mind that `.to()`, just like `.start()`, returns a Promise, when
using "to" on a merged stream it will indeed take a little longer as, when it is being used with "start"
as it has to create a new Kafka Client and Producer Connection for the merged stream. However you must not
use `.start()` on a merged stream.

* It is also important to understand the concept of observers, when using streams. E.g.:

```es6
const stream = kafkaStreams.getKStream("my-topic");
stream.map(..).filter(..).tap(message => console.log(message));
stream.start();
```
* You will never see a log in the console using the code above, even though the kafka topic has messages on it, your filter still leaves messages in the stream and you called "start". And the reason for that is, because the stream is missing an observer. You could either add `.drain()` or `.forEach(m => {})` to the end of the stream to attach an observer.
Keep in mind, that `.to()` always attaches an observer as well.

* When using `.reduce()`, `.forEach()` or `.drain()` they return a Promise that will resolve when the stream completes, running this on stream will require 2 things: 1. you should probably only call them on the end (as multiple observers might cause the messages to be emitted multiple times) of a stream. 2. if you are awaiting the resolution of the promise you will have to cause the stream to complete first e.g. by calling `.take()` before. This behaviour is fundamental to observables.

* Creating a new KTable (table (last state) representation) via:

```es6
const kafkaTopicName = "my-topic";
const toKv = message => {
    const msg = message.split(",");
    return {
        key: msg[0],
        value: msg[1]
    };
};
const table = kafkaStreams.getKTable(kafkaTopicName, toKv);
table.consumeUntilCount(100, () => {
    console.log("topic has been consumed until count of 100 messages.");
});
table.start().then(() => {
    console.log("table stream started, as kafka consumer is ready.");
}, error => {
    console.log("table streamed failed to start: " + error);
});
```
* The main difference between a KStream and KTable is that the table can only represent a certain moment or state of the total events on a stream (messages on a Kafka Topic) as it has to complete before the table can be build and used. You can either do that by awaiting time `.consumeUntilMs(milliseconds)` or counting messages `.consumeUntilCount(messageCount)` or alternatively run until a certain offset is reached with `.consumeUntilLatestOffset()`.

* Additionally a KTable needs a second parameter during creation (compared to a KStream) it needs a function that turns any message it might consume from the topic into a {key, value} pair, as a table can only be build on KV pairs.

* When a table has been built you can access the internal KStorage map, which holds the state of the latest key values.
Via `.getTable().then(table => {})` you can also trigger a replay of all KV pairs in the table at any time after completion by calling `.replay()`.

* A table can be merged with a KStream or another KTable, keep in mind that when merging 2 KTables their storages will be merged, resulting a combination of both internal KStorage maps. Where the left hand table's values might be overwritten by the right hand side, if both contain the equal keys.

* Aggregate Operations TODO
* Window Operations TODO
* JOIN Types TODO
