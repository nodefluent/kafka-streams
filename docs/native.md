Native Consumer/Producer Explanation
====================

- kafka-streams uses `sinek` as underlying kafka client (although it ships its own wrapper)
- sinek comes with 2 kafka-clients `kafka-node` JS and `node-librdkafka` C++
- just like [kafka-connect](https://github.com/nodefluent/kafka-connect) kafka-streams was built to support both clients as of version 3.0.0
- in kafka-streams the `KafkaFactory` will take care of instantiating the correct client for you
    automatically - depending on the configuration that you pass to `KafkaStreams`
- when the `noptions` field is set the native client will be used, if it is not
    the plain (default) configuration will be used for the javascript client
- the installation of the native client might run during installation of kafka-streams
    but it is optional, a failed installation wont affect you, when using the JS client,
    although it might prolong the installation process
- the native client requires additional depdencies, such as `librdkafka` for example
- you can find more details on [usage and installation here](https://github.com/nodefluent/node-sinek/blob/master/lib/librdkafka/README.md)

## Why would I care about the native client?

- the kafka-streams API stays the same
- you will be able to produce & consume faster (by a magnitude compared to the JS client)
- you can tweak the consumer and producer setup better [full list of config params](https://github.com/edenhill/librdkafka/blob/0.9.5.x/CONFIGURATION.md)
- you get access to features like SSL, SASL, and Kerberos
- if tweaked correctly your process will consume less memory

## Installation

### Debian/Ubuntu

- `sudo apt install librdkafka-dev libsasl2-dev`
- `rm -rf node_modules`
- `yarn` # node-rdkafka is installed as optional dependency

### MacOS

- `brew install librdkafka`
- `brew install openssl`
- `rm -rf node_modules`
- `yarn` # node-rdkafka is installed as optional dependency

```shell
  # If you have a ssl problem with an error like: `Invalid value for configuration property "security.protocol"`
  # Add to your shell profile:
  export CPPFLAGS=-I/usr/local/opt/openssl/include
  export LDFLAGS=-L/usr/local/opt/openssl/lib
  # and redo the installation.
```
### Windows

- is not supported currently (might be available soon)

## Use

- make sure to follow the installation steps first
- the only thing left is to change your configuration object
- looking for SSL, SASL or Kerberos examples? [go here](ssl-sasl.md)

## Configuration Example

```javascript
const config = {
    noptions: {
        "metadata.broker.list": "localhost:9092",
        "group.id": "kafka-streams-test-native",
        "client.id": "kafka-streams-test-name-native",
        "event_cb": true,
        "api.version.request": true,
        "compression.codec": "snappy",

        "socket.keepalive.enable": true,
        "socket.blocking.max.ms": 100,

        "enable.auto.commit": false,
        "auto.commit.interval.ms": 100,

        "heartbeat.interval.ms": 250,
        "retry.backoff.ms": 250,

        "fetch.min.bytes": 100,
        "fetch.message.max.bytes": 2 * 1024 * 1024,
        "queued.min.messages": 100,

        "fetch.error.backoff.ms": 100,
        "queued.max.messages.kbytes": 50,

        "fetch.wait.max.ms": 1000,
        "queue.buffering.max.ms": 1000,

        "batch.num.messages": 10000
    },
    tconf: {
        "auto.offset.reset": "earliest",
        "request.required.acks": 1
    }
};
```
