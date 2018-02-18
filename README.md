# node-kafka-streams

**Disclaimer:** We are working on a new release that treats Keys and Values of Kafka Messages just as the official Java Version does it. Please be patient. It will also allow to define partitions and keys during pipes to output topics.

[![Greenkeeper badge](https://badges.greenkeeper.io/nodefluent/kafka-streams.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/nodefluent/kafka-streams.svg?branch=master)](https://travis-ci.org/nodefluent/kafka-streams)
[![npm version](https://badge.fury.io/js/kafka-streams.svg)](https://badge.fury.io/js/kafka-streams)

```
npm install --save kafka-streams
```

```javascript
const {KafkaStreams} = require("kafka-streams");

const config = require("./config.json");
const factory = new KafkaStreams(config);

const kstream = factory.getKStream("input-topic");
const ktable = factory.getKTable(..);

kstream.merge(ktable).filter(..).map(..).reduce(..).to("output-topic");
```

## API Overview

* [Quick Start](docs/quick-start.md)
* [API Info](docs/api.md)
* [Documentation](https://nodefluent.github.io/kafka-streams/jsdoc/)
* [Operator descriptions](docs/most-api.md)
* [Examples](https://github.com/nodefluent/kafka-streams/tree/master/examples)
* [Native Client](docs/native.md) | [SSL, SASL, Kerberos](docs/ssl-sasl.md)

## You might also like

* [node-kafka-connect](https://github.com/nodefluent/kafka-connect)
* [node-schema-registry](https://github.com/nodefluent/schema-registry)
* [node-kafka-rest-ui](https://github.com/nodefluent/kafka-rest-ui)

## README Overview

* [Prerequisites](#prerequisites)
* [Aim of this Library](#aim-of-this-library)
* [Description](#description)
* [Port Progress Overview](#port-progress-overview)
* [Operator Implementations](#operator-implementations)
* [Additional Operators](#additional-operators)
* [Stream Action Implementations](#stream-action-implementations)
* [Join Operators Status](#join-operations)
* [Window Operations](#window-operations)
* [FAQ - More](#more)

## Prerequisites
- kafka broker should be version `>= 0.9.x`, suggested: `>= 0.10.x`
- nodejs should be version `>= 6.10`, suggested: `>= 8.6.x`

## Aim of this Library

- this is not a 1:1 port of the official JAVA kafka-streams
- the goal of this project is to give at least the same options to
a nodejs developer that kafka-streams provides for JVM developers
- stream-state processing, table representation, joins, aggregate etc.
I am aiming for the easiest api access possible checkout the [word count example](https://github.com/nodefluent/kafka-streams/blob/master/examples/wordCount.js)

## Description

[kafka-streams](http://docs.confluent.io/3.0.0/streams) :octopus: equivalent for nodejs :sparkles::turtle::rocket::sparkles:
build on super fast :fire: observables using [most.js](https://github.com/cujojs/most) :metal:

ships with [sinek](https://github.com/nodefluent/node-sinek) :pray: for backpressure

comes with js and native Kafka client, for more performance and SSL, SASL and Kerberos features

the lib also comes with a few `window` operations that are more similar to [Apache Flink](https://flink.apache.org/),
yet they still feel natural in this api :squirrel:

overwriteable local-storage solution allows for any kind of datastore e.g. RocksDB, Redis, Postgres..

async (Promises) and sync stream operators e.g. `stream$.map()` or `stream$.asyncMap()`

super easy API :goberserk:

the lib is based on `sinek`, which is based on kafka-node's `ConsumerGroups`

## Port Progress Overview

- [x] core structure
- [x] KStream base - stream as a changelog
- [x] KTable base - stream as a database
- [x] KStream & KTable cloning
- [x] complex stream join structure
- [ ] advanced joins [see](#join-operations)
- [ ] windows (for joins) [see](#join-operations)
- [ ] flink like window operations
- [x] word-count example
- [x] more examples
- [x] local-storage for etl actions
- [x] local-storage factory (one per action)
- [ ] KStorage example for any DB that supports atomic actions
- [ ] backing-up local-storage via kafka
- [x] kafka client implementation
- [x] KTable replay to Kafka (produce)
- [x] stream for topic message production only
- [x] sinek implementation
- [x] backpressure mode for KafkaClient
- [x] auto-json payloads (read-map/write-map)
- [x] auto producer partition and keyed-message handling
- [x] documentation
- [x] API description
- [ ] higher join & combine examples
- [x] embed native client `librdkafka` for more performance
- [x] SSL
- [x] SASL
- [x] Kerberos


## Operator Implementations

- [x] map
- [x] asyncMap
- [x] constant
- [x] scan
- [x] timestamp
- [x] tap
- [x] filter
- [x] skipRepeats
- [x] skipRepeatsWith
- [x] slice
- [x] take
- [x] skip
- [x] takeWhile
- [x] skipWhile
- [x] until
- [x] since
- [x] reduce
- [x] chainReduce
- [x] forEach (observe)
- [x] chainForEach
- [x] drain
- [x] _zip
- [x] _merge
- [x] _join
- [x] _combine
- [x] _sample
- [x] throttle
- [x] debounce
- [x] delay
- [x] multicast
- A description of the operators can be found [here](docs/most-api.md)
- Missing an operator? Feel free to open an issue :cop:

## Additional Operators

- [x] mapStringToArray
- [x] mapArrayToKV
- [x] mapStringToKV
- [x] mapParse
- [x] mapStringify
- [x] atThroughput
- [x] mapWrapKafkaPayload
- [x] mapToFormat
- [x] mapFromFormat
- Want more? Feel free to open an issue :cop:

## Stream Action Implementations

- [x] countByKey
- [x] sumByKey
- [x] min
- [x] max
- Want more? Feel free to open an issue :cop:

## Join Operations

[Operation description](https://cwiki.apache.org/confluence/display/KAFKA/Kafka+Streams+Join+Semantics)

### KStream Status

- [x] merge
- [ ] outerJoin
- [x] innerJoin
- [ ] leftJoin

### KTable Status

- [x] merge
- [ ] outerJoin
- [ ] innerJoin
- [ ] leftJoin

### KTable <-> KStream Status

- [x] merge
- [ ] outerJoin
- [ ] innerJoin
- [ ] leftJoin

## Window Operations

### KStream

- [x] window

# More

## Can I use this library yet?

Yes.

## Are we ready for production yet?

Probably, yes. :smile:

## Even More

Forks or Stars give motivation :bowtie:
