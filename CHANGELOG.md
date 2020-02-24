# kafka-streams CHANGELOG

## 2020-02-24, Version 5.0.0

* upgraded dependencies
* **BREAKING** please note that the latest sinek (kafka-client) will not install the
native kafka client dependency `node-rdkafka` anymore. In case you are using the
native client with kafka-streams or kafka-connect you have to install it manually (see below).

### A note on native mode

If you are using the native mode (`config: { noptions: {} }`).
You will have to manually install `node-rdkafka` alongside kafka-streams.
(This requires a Node.js version between 9 and 12 and will not work with Node.js >= 13, last tested with 12.16.1)

On Mac OS High Sierra / Mojave:
`CPPFLAGS=-I/usr/local/opt/openssl/include LDFLAGS=-L/usr/local/opt/openssl/lib yarn add --frozen-lockfile node-rdkafka@2.7.4`

Otherwise:
`yarn add --frozen-lockfile node-rdkafka@2.7.4`

(Please also note: Doing this with npm does not work, it will remove your deps, `npm i -g yarn`)

## 2019-07-04, Version 4.12.0

* upgraded dependencies
* fixed issue #91
* added topic extractor example

## 2019-05-16, Version 4.11.0

* added continueWith dsl operation

## 2019-05-13, Version 4.10.0

* fixed typo that broke window functionality
* correctly handling rejection of .to() promise call
* correctly handling produce errors (make sure to sub `kafkaStreams.on("error", (error) => {...});`)
* `KStream.branch([...])` now returns stream clones that consist of deeply cloned events
* `KStream.clone(cloneObjects = false, cloneDeep = false)` now offers optional parameters to clone the stream events,
otherwise mutating the origin stream will alter the cloned stream's objects
* hardened the StreamDSL JSON convenience methods
* other small refactorings

## 2019-05-07, Version 4.9.0

* upgraded dependencies
* fixed bug where kstream merge was not passing kafkaStreams reference
* fixed code formatting
* fixed word-count example
* fixed produceToTopic example
* fixed consumeOneProduceTwo example
* adjusted consumeFromTopic example
* ported most-subject back to 5.3.0 to fix major window bug
* fixed window example

## 2019-09-01, Version 4.8.0

* fixed bug in type declarations
* fixed typo in quick-start docu
* fixed bug in window (createSubject; most-subject switched from async to create..)
* upgraded dependencies (newest native client)

## 2018-09-10, Version 4.7.0

* now referencing new kafka client type (advanced configs) declarations
* upgrade dependencies (kafka clients)

## 2018-09-10, Version 4.6.5

* again fix on type declaration for .to() **sorry**

## 2018-08-10, Version 4.6.4

* removed ncu as dependency, should not have been added after all
* alloing "auto" as partition count param for .to() call
* upgraded sinek from 6.22.2 to 6.22.3

## 2018-21-09, Version 4.6.3

* made topic optional in ts definition for .to() call

## 2018-20-09, Version 4.6.2

* shipping fix for a bug in node-sinek

## 2018-11-09, Version 4.6.1

* added return type for .to() call in ts definition

## 2018-10-09, Version 4.6.0

* added KStream.branch() etl method
* added typescript declarations
* updated dependencies:

sinek        →  ~6.22.0
proxyquire   →  ~2.1.0
bluebird     →  ~3.5.2
uuid         →  ~3.3.2

## 2018-27-06, Version 4.5.0

* updated depdendencies
* new sinek version brings additional metadata methods

## 2018-15-06, Version 4.4.0

* updated dependencies
* new sinek version brings latest node-rdkafka and kafka-node as well as
message value and key buffer encoding for javascript client

## 2018-31-05, Version 4.3.0

* added concatMap dsl method
* added getNewMostFrom methhod
* added example consomeOneProduceTwo

## 2018-18-05, Version 4.2.0

* added new DSL function most.awaitPromises

## 2018-23-04, Version 4.1.0

* added ability to process a different Kafka configuration for producing via `.to()` if the first parameter
is an object. Pass an object to `.to({outputKafkaConfig: {}})` (in case you are not starting a consumer with your stream)
* added ability to process a different Kafka configuration for producing via `.start()`. Pass an object to
`.start({outputKafkaConfig: {}})` (works for KStream and KTable) in case you are starting a consumer and producer on the
same stream.

## 2018-23-04, Version 4.0.2

* fixed typo in messageProduceHandler that caused errors during on demand message production
* now passing version in messageProduceHandler

## 2018-23-04, Version 4.0.1

* fixed empty produce topic from starting consumer even if not needed

## 2018-20-04, Version 4.0.0

**ADDITIONAL FEATURES**:

- KafkaStreams inherits event emitter ("closed" event)
- you can now pass multiple topics to the .getKStream() function
- there is now a .from("topic"|["topics"]) dsl function to subscribe
- mapJSONConvenience, mapStringValueToJSONObject, mapBufferValueToString, mapBufferKeyToString
- wrapAsKafkaValue
- you can now pass batchOptions for the native consumer to via config.batchOptions
- passing batchOptions enforces backpressure mode
- added setProduceHandler and createAndSetProduceHandler methods to register for message delivery

**BREAKING CHANGES**:

- raw events are no streamed with key and value buffers
- mapParse has been renamed to mapJSONParse
- mapWrapKafkaPayload has been renamed to mapWrapKafkaValue
- passing no config object to KafkaStreams will now throw
- (internal) NativeKafka .send() does not handle array of messages anymore
- (internal) NativeKafka produce method params have been altered slightly
- stream events that run through .to will now be checked if they have a message schema,
if they do, their fields (key, value, partition, ..) will be remapped to the produce config

**Other**:

* dropped old crappy/flakey int tests
* added new e2e and unit tests
* all produce activies have been bundled in messageProduceHandle
* folder structure has been refactored
* updated documentation
* added kafka message schemes documentation

## 2017-10-03, Version 3.0.0

* Updated dependencies

* Ships with new sinek version that brings a second kafka-client via librdkafka
* split KafkaClient into JSKafkaClient and NativeKafkaClient based on sineks two clients
* KafkaFactory (used by KafkaStreams) will switch between clients based on config parameters see docs/native.md
* When using the native client: SSL, SASL and Kerberos are available see docs/ssl-sasl.md
* With the help of the native client performance of the library is increased by a magnitude

* **BREAKING CHANGE** `kafkaStreams.closeAll()` returns a promise and awaits the closing of all
    kafka clients as well as storages

* the `/kafka-setup` has been updated with an SSL example

* documentation has been updated

## 2017-08-12, Version 2.3.0

* Minor fixes
* Updated depdendencies

## 2017-07-12, Version 2.1.0

#### (sinek update) Kafka Client is now able to connect directly to the Kafka Broker

* Updated all dependencies
* Clients can now omit Zookeeper and connect directly to a Broker by omitting zkConStr and passing kafkaHost in the config

####  Producer/Consumer Key Changes [#704](https://github.com/SOHU-Co/kafka-node/pull/704)

* **BREAKING CHANGE** The `key` is decoded as a `string` by default. Previously was a `Buffer`. The preferred encoding for the key can be defined by the `keyEncoding` option on any of the consumers and will fallback to `encoding` if omitted

## 2017-07-11, Version 1.32.0

* First entry in CHANGELOG.md
