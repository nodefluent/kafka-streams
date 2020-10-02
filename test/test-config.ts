import { CompressionTypes } from "kafkajs";

//dont use these settings for production, it will set your broker on fire..
const batchOptions = {
  batchSize: 5,
  commitEveryNBatch: 1,
  concurrency: 1,
  commitSync: false,
  noBatchCommits: false
};

export const nativeConfig = {
  noptions: {
    "metadata.broker.list": "localhost:9092", //native client requires broker hosts to connect to
    "group.id": "kafka-streams-test-native",
    "client.id": "kafka-streams-test-name-native",
    "event_cb": true,
    "compression.codec": CompressionTypes.GZIP,
    "api.version.request": true,

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

    "batch.num.messages": 10000,

    "fromBeginning": true,
  },
  tconf: {
    "auto.offset.reset": "earliest",
    "request.required.acks": 1
  },
  batchOptions
};
