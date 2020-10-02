import uuid from "uuid";
import { JSConsumer, JSProducer } from "sinek";
import debugFactory from "debug";
const debug = debugFactory("kafka-streams:jsclient");
import { KafkaClient, KafkaClientStats, KafkaReadyCallback, KafkaErrorCallback } from "./KafkaClient";
import { EventEmitter } from "events";
import { KafkaStreamsConfig } from "../../interfaces";

const NOOP = () => { };

export class JSKafkaClient extends KafkaClient {
	public topic: string[] | string;
	public config: any;
	public kafkaConsumerClient: JSConsumer = null;
	public kafkaProducerClient: JSProducer = null;
	// public consumer: any = null;
	// public producer: Publisher = null;
	public produceTopic: string = null;
	public producePartitionCount = 1;
	
	private _produceHandler: any = null;

	/**
	 * KafkaClient (EventEmitter)
	 * that wraps an internal instance of a
	 * Sinek kafka- Consumer and/or Producer
	 * @param topic
	 * @param config // KafkaConsumerConfig
	 */
	constructor(topic: string, config: any) {
	  super();

	  this.topic = topic;
	  this.config = config;
	}

	/**
	 * sets a handler for produce messages
	 * (emits whenever kafka messages are produced/delivered)
	 * @param handler {EventEmitter}
	 */
	setProduceHandler(handler: EventEmitter): void {
	  this._produceHandler = handler;
	}

	/**
	 * returns the produce handler instance if present
	 * @returns {null|EventEmitter}
	 */
	getProduceHandler(): null | EventEmitter {
	  return this._produceHandler;
	}

	/**
	 * overwrites the topic
	 * @param topics {Array<string>}
	 */
	overwriteTopics(topics: string[]): void {
	  this.topic = topics;
	}

	/**
	 * starts a new kafka consumer (using sinek's partition drainer)
	 * will await a kafka-producer-ready-event if started withProducer=true
	 * @param readyCallback
	 * @param kafkaErrorCallback
	 * @param withProducer
	 * @param withBackPressure
	 */
	start(
	  readyCallback: KafkaReadyCallback = null,
	  kafkaErrorCallback: KafkaErrorCallback = null,
	  withProducer = false,
	  withBackPressure = false
	): void {

	  //might be possible if the parent stream is build to produce messages only
	  if (!this.topic || !this.topic.length) {
	    return;
	  }

		const { kafkaHost, groupId, workerPerPartition, noptions } = this.config;
		const { 
      "metadata.broker.list": brokerList,
    } = this.config.noptions;

	  let conStr = null;

	  if (typeof kafkaHost === "string") {
	    conStr = kafkaHost;
		}
		
		if (typeof brokerList === "string") {
			conStr = brokerList;
		}

	  if (conStr === null) {
	    throw new Error("One of the following: zkConStr or kafkaHost must be defined.");
	  }

	  this.kafkaConsumerClient = new JSConsumer(this.topic, this.config);
	  this.kafkaConsumerClient.connect();
	  // this.kafkaConsumerClient = new Kafka(conStr, logger, conStr === kafkaHost);

	  this.kafkaConsumerClient.on("ready", () => {
	    debug("consumer ready");

	    if (readyCallback) {
	      readyCallback();
	    }
	  });
	  this.kafkaConsumerClient.on("error", kafkaErrorCallback || NOOP);

	  // this.kafkaConsumerClient.becomeConsumer(this.topic, groupId, options || {});

	  // if (withBackPressure) {
	  //   this.consumer = new PartitionDrainer(this.kafkaConsumerClient, workerPerPartition || 1, false, false);
	  // } else {
	  //   this.consumer = new Drainer(this.kafkaConsumerClient, workerPerPartition, true, false, false);
	  // }

	  //consumer has to wait for producer
	  // super.once("kafka-producer-ready", () => {

	  //   if (withBackPressure) {

	  //     if (this.topic.length > 1) {
	  //       throw new Error("JS Client does not support multiple topics in backpressure mode.");
	  //     }

	  //     this.consumer.drain(this.topic[0], (message, done) => {
	  //       super.emit("message", message);
	  //       done();
	  //     }).catch(e => kafkaErrorCallback(e));
	  //   } else {
	  //     this.consumer.drain((message, done) => {
	  //       super.emit("message", message);
	  //       done();
	  //     });
	  //   }
	  // });

	  if (!withProducer) {
	    super.emit("kafka-producer-ready", true);
	  }
	}

	/**
	 * starts a new kafka-producer using sinek's publisher
	 * will fire kafka-producer-ready-event
	 * requires a topic's partition count during initialisation
	 * @param {string} produceTopic
	 * 	 The topic to produce too.
	 * @param {number} partitions
	 * 	 The partitions for the topic.
	 * @param {callback|null} readyCallback
	 * @param {callback|null} kafkaErrorCallback
	 * @param {KafkaStreamsConfig} outputKafkaConfig
	 */
	setupProducer(
	  produceTopic: string,
	  partitions = 1,
	  readyCallback: KafkaReadyCallback = null,
	  kafkaErrorCallback: KafkaErrorCallback = null,
	  outputKafkaConfig: KafkaStreamsConfig
	): void {

	  this.produceTopic = produceTopic || this.produceTopic;
	  this.producePartitionCount = partitions;

	  const { kafkaHost, logger, clientName, noptions } = (outputKafkaConfig || this.config);
		const { 
      "metadata.broker.list": brokerList,
    } = this.config.noptions;

	  let conStr = null;

	  if (typeof kafkaHost === "string") {
	    conStr = kafkaHost;
		}
		
		if (typeof brokerList === "string") {
			conStr = brokerList;
		}

	  if (conStr === null) {
	    throw new Error("One of the following: zkConStr or kafkaHost must be defined.");
	  }

	  //might be possible if the parent stream is build to produce messages only
	  if (!this.kafkaProducerClient) {

		  this.kafkaProducerClient = new JSProducer(this.config);
		  this.kafkaProducerClient.connect();

	    //consumer is awaiting producer
	    this.kafkaProducerClient.on("ready", () => {
	      debug("producer ready");
	      super.emit("kafka-producer-ready", true);
	      if (readyCallback) {
	        readyCallback();
	      }
	    });

	    this.kafkaProducerClient.on("error", kafkaErrorCallback || NOOP);
	  }
	}

	/**
	 * simply produces a message or multiple on a topic
	 * if producerPartitionCount is > 1 it will randomize
	 * the target partition for the message/s
	 * @param topic
	 * @param message
	 * @returns {*}
	 */
	send(topic: string, message: any[]): Promise<void> {

	  if (!this.kafkaProducerClient) {
	    return Promise.reject("producer is not yet setup.");
	  }

	  let partition = -1;
	  if (this.producePartitionCount < 2) {
	    partition = 0;
	  } else {
	    partition = KafkaClient._getRandomIntInclusive(0, this.producePartitionCount);
	  }

	  return this.kafkaProducerClient.send(topic,
	    Buffer.from(Array.isArray(message) ? message : [message]),
	    partition
	  );
	}

	/**
	 * buffers a keyed message to be send
	 * a keyed message needs an identifier, if none is provided
	 * an uuid.v4() will be generated
	 * @param topic
	 * @param identifier
	 * @param payload
	 * @param compressionType
	 * @returns {*}
	 */
	buffer(
	  topic: string,
	  identifier: string,
	  payload: Record<string, unknown>,
	  compressionType = 0
	): Promise<void> {

	  if (!this.kafkaProducerClient) {
	    return Promise.reject("producer is not yet setup.");
	  }

	  if (!identifier) {
	    identifier = uuid.v4();
	  }

	  return this.kafkaProducerClient.buffer(topic, identifier, payload, compressionType);
	}

	/**
	 * buffers a keyed message in (a base json format) to be send
	 * a keyed message needs an identifier, if none is provided
	 * an uuid.4() will be generated
	 * @param topic
	 * @param identifier
	 * @param payload
	 * @param version
	 * @param compressionType
	 * @returns {*}
	 */
	bufferFormat(
	  topic: string,
	  identifier: string,
	  payload: Record<string, unknown>,
	  version = 1,
	  compressionType = 0
	): Promise<void> {

	  if (!this.kafkaProducerClient) {
	    return Promise.reject("producer is not yet setup.");
	  }

	  if (!identifier) {
	    identifier = uuid.v4();
	  }

	  return this.kafkaProducerClient.bufferFormatPublish(topic, identifier, payload, version, compressionType);
	}

	/**
	 * Pauses the client.
	 */
	pause(): void {

	  if (this.kafkaConsumerClient) {
		  this.kafkaConsumerClient.pause();
	  }

	  if (this.kafkaProducerClient) {
	    this.kafkaProducerClient.pause();
	  }
	}
	/**
	 * Resumes the client.
	 */
	resume(): void {

	  if (this.kafkaConsumerClient) {
	    this.kafkaConsumerClient.resume();
	  }

	  if (this.kafkaProducerClient) {
	    this.kafkaProducerClient.resume();
	  }
	}

	/**
	 * Gets stats for the client.
	 */
	getStats(): KafkaClientStats {
	  return {
	    inTopic: this.topic ? this.topic : null,
	    consumer: this.kafkaConsumerClient ? this.kafkaConsumerClient.getStats() : null,

	    outTopic: this.produceTopic ? this.produceTopic : null,
	    producer: this.kafkaProducerClient ? this.kafkaProducerClient.getStats() : null
	  };
	}

	/**
	 * Close the client.
	 * 
	 * @param {boolean} commit 
	 */
	close(commit = false): void {

	  if (this.kafkaConsumerClient) {
	    this.kafkaConsumerClient.close();
	    this.kafkaConsumerClient = null;
	  }

	  if (this.kafkaProducerClient) {
	    this.kafkaProducerClient.close();
	    this.kafkaProducerClient = null;
	  }
	}

	/**
	 * Closes the consumer.
	 */
	closeConsumer(): void {
	  //required by KTable
	  if (this.kafkaConsumerClient) {
	    this.kafkaConsumerClient.close();
	    this.kafkaConsumerClient = null;
	  }
	}
}
