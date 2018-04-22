kafka-streams.js Documentation
==============================

1. Relation to most.js
    * [Similarities](#relation-to-most)

2. Relation to JAVA (kafka) kafka-streams
    * [Similarities](#relation-to-kafka-streams)

3. Relation to Flink
    * [Similarities](#relation-to-flink)

4. How to get started
   * [Getting started](#getting-started)
   * [Using the examples](#the-examples)

5. Documentation (is still WIP)
    * [Dealing with Message Schemas](handling-messages-schemas.md)
    * [HTML-Documentation](https://nodefluent.github.io/kafka-streams/jsdoc/)
    * [MD-Documentation](doc.md)
    * [Using the native client](native.md)
    * [SSL support](ssl-sasl.md)
    * [SASL and Kerberos](ssl-sasl.md)

# 1. most.js

## Relation to most

Both KStream and KTable classes depend on StreamDSL
that internally wraps around `most.js's` observable/stream
as .stream$ class-member.

A large amount of stream operators that most.js offers
are available as functions of KStream & KTable - however
they are not always equal and they NEVER return a new KStream
or KTable instance -> this is a big difference compared to most.js.

Join and window operatios, like .merge() and .window() actually
do return a new KStream or KTable instance as of their nature.

[You can find the most.js project here](https://github.com/cujojs/most)

# 2. Apache kafka-streams

## Relation to kafka-streams

In its core kafka-streams.js tried to adopt the behaviour and
API of the original kafa-streams lib that is part of Kafka.
Due to the nature of NodeJS and observables to decision was made
to simply mimic the API of the original, but not exactly port it
1:1.

Therefore you can expect almost the same functionality under
key-components like KStream and KTable but not exactly the same
API. E.g. KafkaStreams's role as factory.

[You can find the Apache Kafka project here](https://github.com/apache/kafka)

# 3. Apache Flink

## Relation to Flink

Kafka-streams actually implements the concept of `ẁindow`s to enable merge
operations. However the `Flink` project (also a stream-processing framework
similar to kafka-streams) has a different and more advanced approach at windows.
kafka-streams.js offers window operations to merge streams, but it also tries
to offer additional windowing features similar to what Flink offers.

[You can find the Apache Flink project here](https://github.com/apache/flink)

# 4. How to get started

## Getting started

A good place to start using this lib is
the [Quick Start Tutorial](https://github.com/krystianity/kafka-streams/blob/master/docs/quick-start.md), besides the examples.

## The examples

The `/examples` should work out of the box, however they require
you to have a local-setup that works with the tests. So take
a quick look at `/test/test-config.js` and if you do not yet
have a local Zookeeper + Kafka Broker running, take a look at
`/kafka-setup/docker-compose.yml` running `./start.sh` will
start a local combination.
