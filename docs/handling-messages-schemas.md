# Handling Message Schemas

The following document should help you to understand
how the internal streams are connected to Kafka Consumers and Producers
and the schemes of Kafka Message.

# Consume Schema (consuming payloads from Kafka topics)

Lets assume this very simple stream that consumes a kafka topic:

```javascript
"use strict";
const {KafkaStreams} = require("kafka-streams");
const factory = new KafkaStreams({noptions: {/* your kafka config here */}});

const myConsumerStream =
    factory.getKStream()
    .from("my-topic")
    .forEach(console.log);

myConsumerStream.start();
```

The events you would see in the console, would look like this:

```json
{ "value": [21, 34, 12],
  "size": 5,
  "key": [21, 34, 12, 14, 12],
  "topic": "my-output-topic",
  "offset": 46,
  "partition": 0,
  "timestamp": 1524412800216 }
```

As you can see it resembles a Kafka Message, including offset and partition.
Also topic, in case you are consuming multiple at the same time.
To get those bytes into strings, we got you covered.

```javascript
const myConsumerStream =
    factory.getKStream()
    .from("my-topic")
    .mapBufferKeyToString() //key: Buffer -> key: string
    .mapBufferValueToString() //value: Buffer -> value: string
    .forEach(console.log);

myConsumerStream.start();
```

Would look like this:

```json
{ "value": "bla 2",
  "size": 5,
  "key": "c7f21c04-a353-4c19-980a-cca65f50db9a",
  "topic": "my-output-topic",
  "offset": 46,
  "partition": 0,
  "timestamp": 1524412800216 }
```

In case your value (which it is most likely) is a JSON object, you can simply
call this single DSL method that will also take care of the buffers:

```javascript
const myConsumerStream =
    factory.getKStream()
    .from("my-topic")
    .mapJSONConvenience() //{key: Buffer, value: Buffer} -> {key: string, value: Object}
    .forEach(console.log);

myConsumerStream.start();
```

Events would look like this:

```json
{ "value": { "your": "payload object", "is": "here" },
  "size": 5,
  "key": "c7f21c04-a353-4c19-980a-cca65f50db9a",
  "topic": "my-output-topic",
  "offset": 46,
  "partition": 0,
  "timestamp": 1524412800216 }
```

And lets say you only care about the values of the topic, we even got something for that:

```javascript
const myConsumerStream =
    factory.getKStream()
    .from("my-topic")
    .mapJSONConvenience()
    .mapWrapKafkaValue() //{value} -> value
    .forEach(console.log);

myConsumerStream.start();
```

Events would now look like this:

```json
{ "your": "payload object", "is": "here" }
```

# Produce Schema (producing back to Kafka topics)

Lets talk about getting events back out there on a Kafka topic again.
There are 2 things you will need to know:

1. The produceType setting describes how the message format should look like.
There are three available types. You can set the type as third parameter of `stream.to("topic", partitionCount, "send")`

* 1.1 send: Raw messages, no changes to the value, can be any type.
* 1.2 buffer: Gives message values a certain format {id, key, payload, timestamp, version} (requires event to be an object)
* 1.3 bufferFormat: Gives message values a certain format {id, key, payload, timestamp, version, type} (requires event to be an object)

2. Any single (stream) event can overwrite the default settings that you have configured with the `.to()` call.
If it brings a key, value object structure. Like this one:

```json
{ 
  "key": "123",
  "value": "{}",
  "topic": "my-output-topic",
  "partition": 0,
  "partitionKey": null,
  "opaqueKey": null
}
```

These will allow you to overwrite key, partition or topic for every single event.
Additionally you can set partitionKey (which will choose a deterministic partition based on the key).
Make sure to pass the total amount of partitions as second parameter to `.to("topic", 30)`.
And also opaqueKey, which is a second identifier that is passed through the delivery reports.

By default, just the whole stream event will be passed as Kafka message value using the "send" produceType.

Lets take a look at how easy it is to get a stream event (single valued) back into a Kafka message schema.

```javascript
const myConsumerStream =
    factory.getKStream()
    .from("my-topic")
    .mapJSONConvenience()
    .mapWrapKafkaValue()
    .tap(console.log)
    .wrapAsKafkaValue() //value -> {key, value, ..}
    .to("output-topic");

myConsumerStream.start();
```
