# kafka-streams

[![Build Status](https://travis-ci.org/krystianity/kafka-streams.svg?branch=master)](https://travis-ci.org/krystianity/kafka-streams)

> (stateful) kafka stream processing 100% nodejs

## Overview

* [Prerequisites](#prerequisites)
* [Aim of this Library](#aim-of-this-library)
* [Description](#description)
* [Port Progress Overview](#port-progress-overview)
* [Operator Implementations](#operator-implementations)
* [Additional Operators](#additional-operators)
* [Join Operators Status](#join-operations)
* [Stream Action Implementations](#stream-action-implementations)
* [FAQ - More](#more)
* [API Docs](docs/api.md)
* [Operator descriptions](docs/most-api.md)
* [Examples](https://github.com/krystianity/kafka-streams/tree/master/examples)

## Prerequisites
- kafka broker should be version `>= 0.9.x`
- nodejs should be version `>= 6.10`

## Aim of this Library

- this is not a 1:1 port of the official JAVA kafka-streams
- the goal of this project is to give at least the same options to
a nodejs developer that kafka-streams provides for JVM developers
- stream-state processing, table representation, joins, aggregate etc.
I am aiming for the easiest api access possible checkout the [word count example](https://github.com/krystianity/kafka-streams/blob/master/examples/wordCount.js)

## Description

[kafka-streams](http://docs.confluent.io/3.0.0/streams) :octopus: equivalent for nodejs :sparkles::turtle::rocket::sparkles:
build on super fast :fire: observables using [most.js](https://github.com/cujojs/most) :metal:

ships with [sinek](https://github.com/krystianity/node-sinek) :pray: for backpressure

the lib also comes with a few `window` operations that are more similar to [Apache Flink](https://flink.apache.org/),
yet they still feel natural in this api :squirrel:

overwriteable local-storage solution allows for any kind of datastore e.g. RocksDB, Redis, Postgres..

async (Promises) and sync stream operators e.g. `stream$.map()` or `stream$.asyncMap()`

super easy API :goberserk:

the lib is based on `sinek`, which is based on kafka-node's `ConsumerGroups`
therefore it still requires a zookeeper connection (dont worry, your offset will be stored
in the kafka broker)

## Port Progress Overview

- [x] core structure
- [x] KStream base - stream as a changelog
- [x] KTable base - stream as a database
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
- [ ] backpressure mode for KafkaClient
- [x] auto-json payloads (read-map/write-map)
- [x] auto producer partition and keyed-message handling
- [ ] documentation
- [ ] API description
- [ ] higher join & combine examples

## Operator Implementations

- [x] map + asyncMap
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
- [ ] during
- [ ] thru
- [ ] reduce
- [x] forEach
- [ ] drain
- [x] _merge
- [ ] combine
- [ ] sample
- [ ] sampleWith
- [x] _zip
- [ ] switch
- [x] _join
- [ ] throttle
- [ ] debounce
- [ ] delay
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
- [ ] ..
- Want more? Feel free to open an issue :cop:

## Join Operations

### KStream Status

- [x] merge
- [x] window
- [ ] outerJoin
- [ ] innerJoin
- [ ] leftJoin

### KTable Status

- [ ] merge
- [ ] window
- [ ] outerJoin
- [ ] innerJoin
- [ ] leftJoin

### KTable <-> KStream Status

- [ ] merge
- [ ] window
- [ ] outerJoin
- [ ] innerJoin
- [ ] leftJoin

# More

## Can I use this library yet?

No, but very soon (aiming for end of April 2017).

## Are we ready for production yet?

No, please have some more patience :smile:

## Even More

Forks or Stars give motivation :bowtie:
