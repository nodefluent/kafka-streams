# kafka-streams CHANGELOG

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
