import uuid from "uuid";
import { NConsumer, NProducer } from "sinek";
import debugFactory from "debug";
const debug = debugFactory("kafka-streams:nativeclient");
import { KafkaClient, KafkaClientStats, KafkaReadyCallback, KafkaErrorCallback } from "./KafkaClient";
import { KafkaStreamsConfig } from "../../interfaces";
import { EventEmitter } from "events";

const NOOP = () => { };

export class NativeKafkaClient extends KafkaClient {
	public topic: string[] | string;
	public config: KafkaStreamsConfig;
	public batchOptions: any;
	public consumer: any = null;
	public producer: any = null;
	public produceTopic: any = null;
	public producePartitionCount = 1;
	public _produceHandler: any = null;

	/**
     * NativeKafkaClient (EventEmitter)
     * that wraps an internal instance of a
     * Sinek native kafka- Consumer and/or Producer
     * @param topic
     * @param config
     * @param batchOptions - optional
     */
	constructor(topic: string | string[], config: KafkaStreamsConfig, batchOptions = undefined) {
	  super();

	  this.topic = topic;
	  this.config = config;
	  this.batchOptions = batchOptions;
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
	getProduceHandler(): EventEmitter | null {
	  return this._produceHandler;
	}

	/**
	 * overwrites the topic
	 * @param topics {Array<string>}
	 */
	overwriteTopics(topics: string[]): void {
	  this.topic = topics;
	}

	adjustDefaultPartitionCount(partitionCount = 1): void {
	  this.producePartitionCount = partitionCount;
	  this.producer.defaultPartitionCount = partitionCount;
	}

	/**
	 * starts a new kafka consumer
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
	): Promise<void> {

	  //might be possible if the parent stream is build to produce messages only
	  if (!this.topic || !this.topic.length) {
	    return;
	  }

	  //passing batch options will always result in backpressure mode
	  if (this.batchOptions) {
	    withBackPressure = true;
	  }

	  kafkaErrorCallback = kafkaErrorCallback || NOOP;

	  this.consumer = new NConsumer(this.topic, this.config);

	  this.consumer.on("ready", readyCallback || NOOP);
	  this.consumer.on("error", kafkaErrorCallback);

	  //consumer has to wait for producer
	  super.once("kafka-producer-ready", () => {

	    const streamOptions = {
	      asString: false,
	      asJSON: false
	    };

	    //if backpressure is desired, we cannot connect in streaming mode
	    //if it is not we automatically connect in stream mode
	    this.consumer.connect(!withBackPressure, streamOptions).then(() => {
	      debug("consumer ready");

	      if (withBackPressure) {
	        return this.consumer.consume((message, done) => {
	          super.emit("message", message);
	          done();
	        }, false, false, this.batchOptions);
	      } else {
	        this.consumer.on("message", message => {
	          super.emit("message", message);
	        });
	        return this.consumer.consume();
	      }
	    }).catch(e => kafkaErrorCallback(e));
	  });

	  if (!withProducer) {
	    super.emit("kafka-producer-ready", true);
	  }
	}

	/**
	 * starts a new kafka-producer
	 * will fire kafka-producer-ready-event
	 * requires a topic's partition count during initialisation
	 * @param produceTopic
	 * @param partitions
	 * @param readyCallback
	 * @param kafkaErrorCallback
	 * @param outputKafkaConfig
	 */
	setupProducer(
	  produceTopic: string,
	  partitions = 1,
	  readyCallback: KafkaReadyCallback = null,
	  kafkaErrorCallback: KafkaErrorCallback = null,
	  outputKafkaConfig: KafkaStreamsConfig = null
	): void {

	  this.produceTopic = produceTopic || this.produceTopic;
	  this.producePartitionCount = partitions;

	  kafkaErrorCallback = kafkaErrorCallback || NOOP;

	  const config = outputKafkaConfig || this.config;

	  //might be possible if the parent stream is build to produce messages only
	  if (!this.producer) {
	    // Sinek library has some strange null value here so we map this to any
	    this.producer = new NProducer(config, [this.produceTopic] as any, this.producePartitionCount);

	    //consumer is awaiting producer
	    this.producer.on("ready", () => {
	      debug("producer ready");
	      super.emit("kafka-producer-ready", true);
	      if (readyCallback) {
	        readyCallback();
	      }
	    });

	    this.producer.on("error", kafkaErrorCallback);
	    this.producer.connect().catch(e => kafkaErrorCallback(e));
	  }
	}

	//async send(topicName, message, _partition = null, _key = null, _partitionKey = null, _opaqueKey = null)

	/**
	 * simply produces a message or multiple on a topic
	 * if producerPartitionCount is > 1 it will randomize
	 * the target partition for the message/s
	 * @param topicName
	 * @param message
	 * @param partition - optional
	 * @param key - optional
	 * @param partitionKey - optional
	 * @param opaqueKey - optional
	 * @returns {Promise<void>}
	 */
	send(
	  topicName: string,
	  message: Buffer | string | null,
	  partition: number = null,
	  key: string = null,
	  partitionKey: number = null,
	  opaqueKey = null
	): Promise<void> {

	  if (!this.producer) {
	    return Promise.reject("producer is not yet setup.");
	  }

	  return this.producer.send(topicName, message, partition, key, partitionKey, opaqueKey);
	}

	/**
	 * buffers a keyed message to be send
	 * a keyed message needs an identifier, if none is provided
	 * an uuid.v4() will be generated
	 * @param topic
	 * @param identifier
	 * @param payload
	 * @param _ - optional
	 * @param partition - optional
	 * @param version - optional
	 * @param partitionKey - optional
	 * @returns {Promise<void>}
	 */
	buffer(
	  topic: string,
	  identifier: string,
	  payload: Buffer | string | null,
	  _ = null,
	  partition: number = null,
	  version: number = null,
	  partitionKey = null
	 ): Promise<void> {

	  if (!this.producer) {
	    return Promise.reject("producer is not yet setup.");
	  }

	  return this.producer.buffer(topic, identifier, payload, partition, version, partitionKey);
	}

	/**
	 * buffers a keyed message in (a base json format) to be send
	 * a keyed message needs an identifier, if none is provided
	 * an uuid.4() will be generated
	 * @param topic
	 * @param identifier
	 * @param payload
	 * @param version - optional
	 * @param _ - optional
	 * @param partitionKey - optional
	 * @param partition - optional
	 * @returns {Promise<void>}
	 */
	bufferFormat(
	  topic: string,
	  identifier: unknown,
	  payload: Buffer | string | null,
	  version = 1,
	  _ = null,
	  partitionKey = null,
	  partition = null
	): Promise<void> {

	  if (!this.producer) {
	    return Promise.reject("producer is not yet setup.");
	  }

	  if (!identifier) {
	    identifier = uuid.v4();
	  }

	  return this.producer.bufferFormatPublish(topic, identifier, payload, version, undefined, partitionKey, partition);
	}

	pause(): void {
	  //no consumer pause
	  if (this.producer) {
	    this.producer.pause();
	  }
	}

	resume(): void {
	  //no consumer resume
	  if (this.producer) {
	    this.producer.resume();
	  }
	}

	getStats(): KafkaClientStats {
	  return {
	    inTopic: this.topic ? this.topic : null,
	    consumer: this.consumer ? this.consumer.getStats() : null,

	    outTopic: this.produceTopic ? this.produceTopic : null,
	    producer: this.producer ? this.producer.getStats() : null
	  };
	}

	close(commit = false): void {

	  if (this.consumer) {
	    this.consumer.close(commit);
	  }

	  if (this.producer) {
	    this.producer.close();
	  }
	}

	//required by KTable
	closeConsumer(commit = false): void {
	  if (this.consumer) {
	    this.consumer.close(commit);
	    this.consumer = null;
	  }
	}
}
