"use strict";

const log4bro = require("log4bro");

const config = {
    zkConStr: "localhost:2181/",
    logger: new log4bro({ level: "INFO" }),
    groupId: "kafka-streams-test",
    clientName: "kafka-streams-test-name",
    workerPerPartition: 1,
    options: {
        sessionTimeout: 8000,
        protocol: ["roundrobin"],
        fromOffset: "earliest", //latest
        fetchMaxBytes: 1024 * 25,
        fetchMinBytes: 1,
        fetchMaxWaitMs: 100,
        heartbeatInterval: 250,
        retryMinTimeout: 250,
        autoCommit: true,
        autoCommitIntervalMs: 1000,
        requireAcks: 0,
        //ackTimeoutMs: 100,
        //partitionerType: 3
    }
};

module.exports = config;
