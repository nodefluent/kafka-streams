import { EventEmitter } from "events";
import * as most from "most";
import { Observable, Subscriber as Observer, Subscription } from "most";
import { Promise } from "bluebird";
import { v4 as uuidv4 } from "uuid";
import debugFactory from "debug";
const debug = debugFactory("kafka-streams:streamdsl");
import KStorage from "../KStorage";
import { KafkaClient } from "../client/KafkaClient";
import { messageProduceHandle } from "../messageProduceHandle";
import PRODUCE_TYPES from "../produceTypes";
import { KeyCount, Sum, Min, Max } from "../actions";

const NOOP = () => {};
const MESSAGE = "message";
const DEFAULT_AUTO_FLUSH_BUFFER_SIZE = 100;

/**
 * Stream base class
 */
export class StreamDSL implements Observable<any> {
  public noTopicProvided: any;
  public topicName: any;
  public kafka: any;
  public storage: any;
  public isClone: any;
  public _ee: any;
  public stream$: any;
  public produceAsTopic: any;
  public outputTopicName: any;
  public outputPartitionsCount: any;
  public produceType: any;
  public produceVersion: any;
  public produceCompressionType: any;
  public _kafkaStreams: any;
  public PRODUCE_TYPES: any;
  public DEFAULT_AUTO_FLUSH_BUFFER_SIZE: any;

  /**
   * Stream base class that wraps around a private most.js stream$
   * and interacts with storages/actions and a kafka-client instance.
   * @param {string|Array<string>} topicName - can also be topics
   * @param {KStorage} storage
   * @param {KafkaClient} kafka
   * @param {boolean} isClone
   */
  constructor(topicName, storage = null, kafka = null, isClone = false) {
    debug("stream-dsl from clone", isClone, "for", topicName);

    if (!isClone && (!kafka || !(kafka instanceof KafkaClient))) {
      throw new Error("kafka has to be an instance of KafkaClient.");
    }

    if (!storage || !(storage instanceof KStorage)) {
      throw new Error("storage hsa to be an instance of KStorage.");
    }

    //convenience
    if (!topicName) {
      this.noTopicProvided = true;
    } else {
      this.noTopicProvided = false;

      if (!Array.isArray(topicName)) {
        topicName = [topicName];
      }
    }

    //no topics is allowed for produce only streams
    this.topicName = topicName || [];

    this.kafka = kafka;
    this.storage = storage;
    this.isClone = isClone;

    if (!(this.storage instanceof KStorage)) {
      throw new Error("storage must be an instance of KStorage.");
    }

    this._ee = new EventEmitter();
    this.stream$ = most.fromEvent(MESSAGE, this._ee);

    this.produceAsTopic = false;
    this.outputTopicName = null;
    this.outputPartitionsCount = 1;
    this.produceType = PRODUCE_TYPES.SEND;
    this.produceVersion = 1;
    this.produceCompressionType = 0;

    this._kafkaStreams = null;

    this.PRODUCE_TYPES = PRODUCE_TYPES;
    this.DEFAULT_AUTO_FLUSH_BUFFER_SIZE = DEFAULT_AUTO_FLUSH_BUFFER_SIZE;
  }

  /**
   * dummy, should be overwritten
   */
  start() {
    return Promise.reject(
      "When inherting StreamDSL, the start method should be overwritten with connector logic."
    );
  }

  /**
   * returns a stats object with information
   * about the internal kafka clients
   * @returns {object}
   */
  getStats() {
    return this.kafka ? this.kafka.getStats() : null;
  }

  /**
   * returns the internal KStorage instance
   * @returns {KStorage}
   */
  getStorage() {
    return this.storage;
  }

  /**
   * can be used to manually write message/events
   * to the internal stream$
   * @param message {Object|Array<Object>}
   */
  writeToStream(message) {
    if (!Array.isArray(message)) {
      return this._ee.emit("message", message);
    }

    message.forEach((_message) => {
      this._ee.emit("message", _message);
    });
  }

  /**
   * returns the internal most.js stream
   * @returns {Object} most.js stream
   */
  getMost() {
    return this.stream$;
  }

  /**
   * returns a new most stream from the
   * given array
   * @param array
   * @returns {Stream<any>}
   */
  getNewMostFrom(array = []) {
    return most.from(array);
  }

  /**
   * used to clone or during merges
   * resets the internal event emitter to the new stream
   * and replaces the internal stream with the merged new stream
   * @param newStream$
   */
  replaceInternalObservable(newStream$) {
    this._ee.removeAllListeners(MESSAGE);
    this._ee = new EventEmitter();
    this.stream$ = most.merge(newStream$, most.fromEvent(MESSAGE, this._ee));
  }

  /**
   * sets a handler for produce messages
   * (emits whenever kafka messages are produced/delivered)
   * events: produced, delivered
   * @param handler {module:events.internal}
   */
  setProduceHandler(handler) {
    if (!handler || !(handler instanceof EventEmitter)) {
      throw new Error(
        "ProduceHandler must be an instance of EventEmitter (events)."
      );
    }

    this.kafka.setProduceHandler(handler);
  }

  /**
   * creates (and returns) and sets a produce handler
   * for this stream instance
   * @returns {module:events.internal}
   */
  createAndSetProduceHandler() {
    const ee = new EventEmitter();
    this.setProduceHandler(ee);
    return ee;
  }

  /**
   * overwrites the internal kafkaStreams reference
   * @param reference
   */
  setKafkaStreamsReference(reference) {
    this._kafkaStreams = reference;
  }

  /**
   * Treats stream as an observable and allows others to subscribe to it
   *
   * @param {Observer} observer
   * @returns {Function} Unsubscribe function
   */
  subscribe(observer: Observer<any>): Subscription<any> {
    return this.stream$.subscribe(observer);
  }

  /*
   *   #           #
   *  ##           ##
   * ###    DSL    ###
   *  ##           ##
   *   #           #
   */

  /**
   * add more topic/s to the consumer
   * @param topicName {string|Array<string>}
   * @returns {StreamDSL}
   */
  from(topicName) {
    if (!Array.isArray(topicName)) {
      topicName = [topicName];
    }

    topicName.forEach((topic) => {
      this.topicName.push(topic);
    });

    if (this.noTopicProvided) {
      this.noTopicProvided = false;
    }

    return this;
  }

  /**
   * given a stream of promises, returns stream containing the fulfillment values
   * etl = Promise -> v
   * @param etl
   * @returns {StreamDSL}
   */
  awaitPromises(etl) {
    this.stream$ = this.stream$.awaitPromises(etl);
    return this;
  }

  /**
   * simple synchronous map function
   * etl = v -> v2
   * @param etl
   * @returns {StreamDSL}
   */
  map(etl) {
    this.stream$ = this.stream$.map(etl);
    return this;
  }

  /**
   * map that expects etl to return a Promise
   * can be used to apply async maps to stream
   * etl = v -> Promise
   * @param etl
   * @returns {StreamDSL}
   */
  asyncMap(etl) {
    this.stream$ = this.stream$.flatMap((value) =>
      most.fromPromise(etl(value))
    );
    return this;
  }

  /**
   * transform each etl in stream into a stream,
   * and then concatenate it onto the end of the resulting stream.
   * etl = v -> stream(v2)
   * @param etl
   * @returns {StreamDSL}
   */
  concatMap(etl) {
    this.stream$ = this.stream$.concatMap(etl);
    return this;
  }

  /**
   * (do not use for side effects,
   * except for a closing operation at the end of the stream)
   * may not be used to chain
   * eff = v -> void
   * @param eff
   * @returns Promise{*}
   */
  forEach(eff) {
    return this.stream$.forEach(eff);
  }

  /**
   * runs forEach on a multicast stream
   * you probably would not want to use this in production
   * @param eff
   * @param callback
   * @returns {StreamDSL}
   */
  chainForEach(eff, callback = null) {
    this.stream$ = this.stream$.multicast();
    this.stream$.forEach(eff).then(
      (r) => {
        if (callback) {
          callback(null, r);
        }
      },
      (e) => {
        if (callback) {
          callback(e);
        }
      }
    );
    return this;
  }

  /**
   * (alternative to forEach if in the middle of a
   * stream operation chain)
   * use this for side-effects
   * errors in eff will break stream
   * @param eff
   */
  tap(eff) {
    this.stream$ = this.stream$.tap(eff);
    return this;
  }

  /**
   * stream contains only events for which predicate
   * returns true
   * pred = v -> boolean
   * @param pred
   * @returns {StreamDSL}
   */
  filter(pred) {
    this.stream$ = this.stream$.filter(pred);
    return this;
  }

  /**
   * will remove duplicate messages
   * be aware that this might take a lot of memory
   * @returns {StreamDSL}
   */
  skipRepeats() {
    this.stream$ = this.stream$.skipRepeats();
    return this;
  }

  /**
   * skips repeats per your definition
   * equals = (a,b) -> boolean
   * @param equals
   * @returns {StreamDSL}
   */
  skipRepeatsWith(equals) {
    this.stream$ = this.stream$.skipRepeatsWith(equals);
    return this;
  }

  /**
   * skips the amount of messages
   * @param count
   * @returns {StreamDSL}
   */
  skip(count) {
    this.stream$ = this.stream$.skip(count);
    return this;
  }

  /**
   * takes the first messages until count
   * and omits the rest
   * @param count
   * @returns {StreamDSL}
   */
  take(count) {
    this.stream$ = this.stream$.take(count);
    return this;
  }

  multicast() {
    this.stream$ = this.stream$.multicast();
    return this;
  }

  /**
   * easy string to array mapping
   * you can pass your delimiter
   * default is space
   * "bla blup" => ["bla", "blup"]
   * @param delimiter
   * @returns {StreamDSL}
   */
  mapStringToArray(delimiter = " ") {
    return this.map((element) => {
      if (!element || typeof element !== "string") {
        return element;
      }

      return element.split(delimiter);
    });
  }

  /**
   * easy array to key-value object mapping
   * you can pass your own indices
   * default is 0,1
   * ["bla", "blup"] => { key: "bla", value: "blup" }
   * @param keyIndex
   * @param valueIndex
   * @returns {StreamDSL}
   */
  mapArrayToKV(keyIndex = 0, valueIndex = 1) {
    return this.map((element) => {
      if (!Array.isArray(element)) {
        return element;
      }

      return {
        key: element[keyIndex],
        value: element[valueIndex],
      };
    });
  }

  /**
   * easy string to key-value object mapping
   * you can pass your own delimiter and indices
   * default is " " and 0,1
   * "bla blup" => { key: "bla", value: "blup" }
   * @param delimiter
   * @param keyIndex
   * @param valueIndex
   * @returns {StreamDSL}
   */
  mapStringToKV(delimiter = " ", keyIndex = 0, valueIndex = 1) {
    this.mapStringToArray(delimiter);
    this.mapArrayToKV(keyIndex, valueIndex);
    return this;
  }

  /**
   * maps every stream event through JSON.parse
   * if its type is an object
   * (if parsing fails, the error object will be returned)
   * @returns {StreamDSL}
   */
  mapJSONParse() {
    return this.map((string) => {
      if (typeof string !== "string") {
        return string;
      }

      try {
        return JSON.parse(string);
      } catch (e) {
        return e;
      }
    });
  }

  /**
   * maps every stream event through JSON.stringify
   * if its type is object
   * @returns {StreamDSL}
   */
  mapStringify() {
    return this.map((object) => {
      if (typeof object !== "object") {
        return object;
      }

      return JSON.stringify(object);
    });
  }

  /**
   * maps an object type event with a Buffer key field
   * to an object event with a string key field
   * @returns {StreamDSL}
   */
  mapBufferKeyToString() {
    return this.map((object) => {
      if (typeof object !== "object" || !object.key) {
        return object;
      }

      if (!Buffer.isBuffer(object.key)) {
        return object;
      }

      try {
        const key = object.key.toString("utf8");
        if (key) {
          object.key = key;
        }
      } catch (_) {
        //empty
      }

      return object;
    });
  }

  /**
   * maps an object type event with a Buffer value field
   * to an object event with a string value field
   * @returns {StreamDSL}
   */
  mapBufferValueToString() {
    return this.map((object) => {
      if (typeof object !== "object" || !object.value) {
        return object;
      }

      if (typeof object.value === "string") {
        return object;
      }

      try {
        const value = object.value.toString("utf8");
        if (value) {
          object.value = value;
        }
      } catch (_) {
        //empty
      }

      return object;
    });
  }

  /**
   * maps an object type event with a string value field
   * to an object event with (parsed) object value field
   * @returns {StreamDSL}
   */
  mapStringValueToJSONObject() {
    return this.map((object) => {
      if (typeof object !== "object" || !object.value) {
        return object;
      }

      if (typeof object.value === "object") {
        return object;
      }

      try {
        const value = JSON.parse(object.value);
        if (value) {
          object.value = value;
        }
      } catch (_) {
        //empty
      }

      return object;
    });
  }

  /**
   * takes a buffer kafka message
   * and turns it into a json representation
   * buffer key -> string
   * buffer value -> string -> object
   * @returns {StreamDSL}
   */
  mapJSONConvenience() {
    return this.mapBufferKeyToString()
      .mapBufferValueToString()
      .mapStringValueToJSONObject();
  }

  /**
   * wraps an event value inside a kafka message object
   * the event value will be used as value of the kafka message
   * @param topic - optional
   * @returns {StreamDSL}
   */
  wrapAsKafkaValue(topic = undefined) {
    return this.map((any) => {
      return {
        opaqueKey: null,
        partitionKey: null,
        partition: null,
        key: null,
        value: any,
        topic,
      };
    });
  }

  /**
   * maps every stream event's kafka message
   * right to its payload value
   * @returns {StreamDSL}
   */
  mapWrapKafkaValue() {
    return this.map((message) => {
      if (typeof message === "object" && typeof message.value !== "undefined") {
        return message.value;
      }

      return message;
    });
  }

  /**
   * taps to the stream
   * counts messages and returns
   * callback once (when message count is reached)
   * with the current message at count
   * @param {number} count
   * @param {function} callback
   * @returns {StreamDSL}
   */
  atThroughput(count = 1, callback) {
    let countState = 0;
    this.tap((message) => {
      if (countState > count) {
        return;
      }

      countState++;
      if (count === countState) {
        callback(message);
      }
    });

    return this;
  }

  /**
   * * default kafka format stringify
   * {} -> {payload, time, type, id}
   * getId can be a function to read the id from the message
   * e.g. getId = message -> message.id
   * @param type
   * @param getId
   * @returns {StreamDSL}
   */
  mapToFormat(type = "unknown-publish", getId = null) {
    this.map((message) => {
      const id = getId ? getId(message) : uuidv4();

      return {
        payload: message,
        time: new Date().toISOString(),
        type,
        id,
      };
    });

    return this;
  }

  /**
   * default kafka format parser
   * {value: "{ payload: {} }" -> {}
   * @returns {StreamDSL}
   */
  mapFromFormat() {
    this.map((message) => {
      if (typeof message === "object") {
        return message.payload;
      }

      try {
        const object = JSON.parse(message);
        if (typeof object === "object") {
          return object.payload;
        }
      } catch (e) {
        //empty
      }

      return message;
    });

    return this;
  }

  /**
   * maps elements into {time, value} objects
   * @param etl
   * @returns {StreamDSL}
   */
  timestamp(etl) {
    if (!etl) {
      this.stream$ = this.stream$.timestamp();
      return this;
    }

    this.stream$ = this.stream$.map((element) => {
      return {
        time: etl(element),
        value: element,
      };
    });

    return this;
  }

  /**
   * replace every element with the substitute value
   * @param substitute
   * @returns {StreamDSL}
   */
  constant(substitute) {
    this.stream$ = this.stream$.constant(substitute);
    return this;
  }

  /**
   * mapping to incrementally accumulated results,
   * starting with the provided initial value.
   * @param eff
   * @param initial
   * @returns {StreamDSL}
   */
  scan(eff, initial) {
    this.stream$ = this.stream$.scan(eff, initial);
    return this;
  }

  /**
   * slicing events from start ot end of index
   * @param start
   * @param end
   * @returns {StreamDSL}
   */
  slice(start, end) {
    this.stream$ = this.stream$.slice(start, end);
    return this;
  }

  /**
   * contain events until predicate
   * returns false
   * m -> !!m
   * @param pred
   * @returns {StreamDSL}
   */
  takeWhile(pred) {
    this.stream$ = this.stream$.takeWhile(pred);
    return this;
  }

  /**
   * contain events after predicate
   * returns false
   * @param pred
   * @returns {StreamDSL}
   */
  skipWhile(pred) {
    this.stream$ = this.stream$.skipWhile(pred);
    return this;
  }

  /**
   * contain events until signal$ emits first event
   * signal$ must be a most stream instance
   * @param signal$
   * @returns {StreamDSL}
   */
  until(signal$) {
    this.stream$ = this.stream$.until(signal$);
    return this;
  }

  /**
   * contain all events after signal$ emits first event
   * signal$ must be a most stream instance
   * @param signal$
   * @returns {StreamDSL}
   */
  since(signal$) {
    this.stream$ = this.stream$.since(signal$);
    return this;
  }

  /**
   * Replace the end signal with a new stream returned by f.
   * Note that f must return a (most.js) stream.
   * @param f - function (must return a most stream)
   */
  continueWith(f) {
    this.stream$ = this.stream$.continueWith(f);
    return this;
  }

  /**
   * reduce a stream to a single result
   * will return a promise
   * @param eff
   * @param initial
   * @returns Promise{*}
   */
  reduce(eff, initial) {
    return this.stream$.reduce(eff, initial);
  }

  /**
   * runs reduce on a multicast stream
   * you probably would not want to use this in production
   * @param eff
   * @param initial
   * @param callback
   * @returns {StreamDSL}
   */
  chainReduce(eff, initial, callback) {
    this.stream$ = this.stream$.multicast();
    this.stream$.reduce(eff, initial).then(
      (r) => {
        if (callback) {
          callback(null, r);
        }
      },
      (e) => {
        if (callback) {
          callback(e);
        }
      }
    );
    return this;
  }

  /**
   * drains the stream, equally to forEach
   * without iterator, returns a promise
   * @returns Promise{*}
   */
  drain() {
    return this.stream$.drain();
  }

  /**
   * limits rate events at most one per throttlePeriod
   * throttlePeriod = index count omit
   * @param throttlePeriod
   * @returns {StreamDSL}
   */
  throttle(throttlePeriod) {
    this.stream$ = this.stream$.throttle(throttlePeriod);
    return this;
  }

  /**
   * delays every event in stream by given time
   * @param delayTime
   * @returns {StreamDSL}
   */
  delay(delayTime) {
    this.stream$ = this.stream$.delay(delayTime);
    return this;
  }

  /**
   * wait for a burst of events and emit
   * only the last event
   * @param debounceTime
   * @returns {StreamDSL}
   */
  debounce(debounceTime) {
    this.stream$ = this.stream$.debounce(debounceTime);
    return this;
  }

  /*
   *   #           #
   *  ##           ##
   * ### AGGREGATE ###
   *  ##           ##
   *   #           #
   */

  /**
   * maps into counts per key
   * requires events to have a present key/value field
   * @param key
   * @param countFieldName
   * @returns {StreamDSL}
   */
  countByKey(key = "key", countFieldName = "count") {
    const keyCount = new KeyCount(this.storage, key, countFieldName);
    this.asyncMap(keyCount.execute.bind(keyCount));
    return this;
  }

  /**
   * maps into sums per key
   * requires events to have a present key/value field
   * @param key
   * @param fieldName
   * @param sumField
   * @returns {StreamDSL}
   */
  sumByKey(key = "key", fieldName = "value", sumField = false) {
    const sum = new Sum(this.storage, key, fieldName, sumField);
    this.asyncMap(sum.execute.bind(sum));
    return this;
  }

  /**
   * collects the smallest value
   * of the given field, will not alter
   * the events in the stream
   * use .getStorage().getMin() to get the
   * latest value which is stored
   * @param fieldName
   * @param minField
   * @returns {StreamDSL}
   */
  min(fieldName = "value", minField = "min") {
    const min = new Min(this.storage, fieldName, minField);
    this.asyncMap(min.execute.bind(min));
    return this;
  }

  /**
   * collects the greatest value
   * of the given field, will not alter
   * the events in the stream
   * use .getStorage().getMax() to get the
   * latest value which is stored
   * @param fieldName
   * @param maxField
   * @returns {StreamDSL}
   */
  max(fieldName = "value", maxField = "max") {
    const max = new Max(this.storage, fieldName, maxField);
    this.asyncMap(max.execute.bind(max));
    return this;
  }

  /*
   *   #           #
   *  ##           ##
   * ###   JOINS   ###
   *  ##           ##
   *   #           #
   */

  /**
   * use this as base of a higher-order stream
   * and merge all child streams into a new stream
   * @private
   */
  _join() {
    this.stream$ = most.join(this.stream$);
    return this;
  }

  /**
   * merge this stream with another, resulting a
   * stream with all elements from both streams
   * @param otherStream$
   */
  _merge(otherStream$) {
    this.stream$ = most.merge(this.stream$, otherStream$);
    return this;
  }

  /**
   * merge this stream with another stream
   * by combining (zipping) every event from each stream
   * to a single new event on the new stream
   * combine = (e1, e2) -> e1 + e2
   * @param otherStream$
   * @param combine
   */
  _zip(otherStream$, combine) {
    this.stream$ = this.stream$.zip(combine, otherStream$);
    return this;
  }

  /**
   * merge this stream with another stream
   * by combining (while awaiting) every event from each stream
   * combine = (e1, e2) -> e1 + e2
   * @param otherStream$
   * @param combine
   * @returns {StreamDSL}
   * @private
   */
  _combine(otherStream$, combine) {
    this.stream$ = this.stream$.combine(combine, otherStream$);
    return this;
  }

  /**
   * merge this stream with another on behalf of
   * a sample stream
   * combine = (e1, e2) -> e1 + e2
   * @param sampleStream$
   * @param otherStream$
   * @param combine
   * @returns {StreamDSL}
   * @private
   */
  _sample(sampleStream$, otherStream$, combine) {
    this.stream$ = sampleStream$.sample(combine, this.stream$, otherStream$);
    return this;
  }

  /*
   *   #           #
   *  ##           ##
   * ###  OUTPUT   ###
   *  ##           ##
   *   #           #
   */

  /**
   * define an output topic
   * when passed to KafkaStreams this will trigger
   * the stream$ result to be produced to the given topic name
   * if the instance is a clone, this function call will have to setup a kafka producer
   * returns a promise
   * @param {string|Object} topic - optional (can also be an object, containing the same parameters as fields)
   * @param {number} outputPartitionsCount - optional
   * @param {string} produceType - optional
   * @param {number} version - optional
   * @param {number} compressionType - optional
   * @param {function} producerErrorCallback - optional
   * @param {Object} outputKafkaConfig - optional
   * @returns {Promise.<boolean>}
   */
  to(
    topic = undefined,
    outputPartitionsCount = 1,
    produceType = "send",
    version = 1,
    compressionType = 0,
    producerErrorCallback = null,
    outputKafkaConfig = null
  ) {
    return new Promise((resolve, reject) => {
      if (this.produceAsTopic) {
        return reject(
          new Error(".to() has already been called on this dsl instance.")
        );
      }

      this.produceAsTopic = true;

      //map object if first param is a config object
      if (topic && typeof topic === "object") {
        if (topic.outputPartitionsCount) {
          outputPartitionsCount = topic.outputPartitionsCount;
        }

        if (topic.produceType) {
          produceType = topic.produceType;
        }

        if (topic.version) {
          version = topic.version;
        }

        if (topic.compressionType) {
          compressionType = topic.compressionType;
        }

        if (topic.producerErrorCallback) {
          producerErrorCallback = topic.producerErrorCallback;
        }

        if (topic.outputKafkaConfig) {
          outputKafkaConfig = topic.outputKafkaConfig;
        }

        if (topic.topic) {
          topic = topic.topic;
        }
      }

      produceType = produceType || "";
      produceType = produceType.toLowerCase();
      const produceTypes = Object.keys(PRODUCE_TYPES).map(
        (k) => PRODUCE_TYPES[k]
      );
      if (produceTypes.indexOf(produceType) === -1) {
        return reject(
          new Error(
            `produceType must be a supported types: ${produceTypes.join(", ")}.`
          )
        );
      }

      this.outputTopicName = topic;
      this.outputPartitionsCount = outputPartitionsCount;
      this.produceType = produceType;
      this.produceVersion = version;
      this.produceCompressionType = compressionType;

      if (!this.isClone) {
        return resolve(true);
      }

      //this instance is a clone, meaning that it has been created
      //as the result of a KStream or KTable merge
      //which requires the creation of a Producer for .to() to work first

      if (!this.kafka || !this.kafka.setupProducer) {
        return reject(
          new Error(
            "setting .to() on a cloned KStream requires a kafka client to injected during merge."
          )
        );
      }

      if (!this._kafkaStreams) {
        return reject(
          new Error(
            "KafkaStreams reference missing on stream instance, failed to setup to(..)"
          )
        );
      }

      const oldProducerErrorCallback = producerErrorCallback;
      producerErrorCallback = (error) => {
        if (oldProducerErrorCallback) {
          oldProducerErrorCallback(error);
        }

        this._kafkaStreams.emit("error", error);
      };

      this.kafka.setupProducer(
        this.outputTopicName,
        this.outputPartitionsCount,
        resolve,
        producerErrorCallback || NOOP,
        outputKafkaConfig
      );

      this.forEach((message) => {
        messageProduceHandle(
          this.kafka,
          message,
          this.outputTopicName,
          this.produceType,
          this.produceCompressionType,
          this.produceVersion,
          producerErrorCallback
        );
      });
    });
  }
}
