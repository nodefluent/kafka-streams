Quick Start Tutorial
====================

# Requirements

* Before you get started, make sure you have installed NodeJS (at least version 6.10, better latest) 
running on your system and a local Zookeeper (:2181) and Kafka Broker (:9092) (if you are running
these services elsewhere, make sure to adapt the config settings)
* You can find the latest NodeJS version [here](https://nodejs.org/en/download/) (if you didnt know already)
* When you are in need of a `handsfree` local kafka setup, just take a look at `/kafka-setup/start.sh` (you will need docker and docker-compose for this to work)
* Installing kafka-streams in an exsting project (directory with package.json) is quite easy: `npm install --save kafka-streams`

# Configuration

```es6
{
    zkConStr: "localhost:2181/",
    logger: {
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
        //ackTimeoutMs: 100,
        //partitionerType: 3
    }
}
```

* Config is a simple object that is being passed to the constructor of
KafkaStreams, which will result an a new Factory for KStreams and KTables on the
outside and KafkaClients and Storages on the inside.

* The sub-object options supports all settings provided by the `kafka-node`
module.

# The API

```es6
const {KafkaStreams} = require("kafka-streams");
```

* Understanding the KafkaStreams object. TODO
