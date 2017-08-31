"use strict";

const log4bro = require("log4bro");

const config = {
    //zkConStr: "localhost:2181/",
    kafkaHost: "localhost:9092",
    logger: new log4bro({ level: "INFO" }),
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
        requireAcks: 0,
        //ackTimeoutMs: 100,
        //partitionerType: 3
    }
};

const nativeConfig = {
    noptions: {
        "metadata.broker.list": "localhost:9092",
        "group.id": "kafka-streams-test-native",
        "client.id": "kafka-streams-test-name-native",
        "enable.auto.commit": true,
        "event_cb": true,

        "fetch.wait.max.ms": 10,
        "heartbeat.interval.ms": 250,
        "retry.backoff.ms": 250,
        "auto.commit.interval.ms": 1000,
        "fetch.min.bytes": 1,
        "fetch.message.max.bytes": 1024 * 100
    },
    tconf: {
        "auto.offset.reset": "earliest",
        "request.required.acks": 0
    }
};

module.exports = {
    config,
    nativeConfig
};
