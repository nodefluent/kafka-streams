"use strict";

const EventEmitter = require("events");
const most = require("most");
const Promise = require("bluebird");

const StreamDSL = require("./StreamDSL.js");
const {LastState} = require("../actions/index");
const StorageMerger = require("../StorageMerger.js");
const {messageProduceHandle} = require("../messageProduceHandle.js");

const MESSAGE = "message";
const NOOP = () => {};

/**
 * table representation of a stream
 */
class KTable extends StreamDSL {

    /**
     * creates a table representation of a stream
     * join operations of ktable instances are asynchronous
     * and return promises
     * keyMapETL = v -> {key, value} (sync)
     * @param {string} topicName
     * @param {function} keyMapETL
     * @param {KStorage} storage
     * @param {KafkaClient} kafka
     * @param {boolean} isClone
     */
    constructor(topicName, keyMapETL, storage = null, kafka = null, isClone = false) {
        super(topicName, storage, kafka, isClone);

        //KTable only works on {key, value} payloads
        if (typeof keyMapETL !== "function") {
            throw new Error("keyMapETL must be a valid function.");
        }

        this._tee = new EventEmitter();
        this.started = false;
        this.finalised = false;

        //will close on first stream$.onComplete()
        this.consumerOpen = true;

        if (!isClone) {
            this.map(keyMapETL);
        } else {
            this.consumerOpen = false;
            this.started = true;
            this._bindToTableStream();
        }
    }

    /**
     * start kafka consumption
     * prepare production of messages if necessary
     * when called with zero or just a single callback argument
     * this function will return a promise and use the callback for errors
     * @param {function|Object} kafkaReadyCallback - can also be an object (config)
     * @param {function} kafkaErrorCallback
     * @param {boolean} withBackPressure
     * @param {Object} outputKafkaConfig
     */
    start(kafkaReadyCallback = null, kafkaErrorCallback = null, withBackPressure = false, outputKafkaConfig = null){

        if(kafkaReadyCallback && typeof kafkaReadyCallback === "object" && arguments.length < 2){
            return new Promise((resolve, reject) => {
                this._start(resolve, reject, kafkaReadyCallback.withBackPressure, kafkaReadyCallback.outputKafkaConfig);
            });
        }

        if(arguments.length < 2){
            return new Promise((resolve, reject) => {
                this._start(resolve, reject, withBackPressure);
            });
        }

        return this._start(kafkaReadyCallback, kafkaErrorCallback, withBackPressure, outputKafkaConfig);
    }

    _start(kafkaReadyCallback = null, kafkaErrorCallback = null, withBackPressure = false, outputKafkaConfig = null){

        if(this.started){
            throw new Error("this KTable is already started.");
        }

        this.started = true;

        if(!this.topicName && !this.produceAsTopic){
            return kafkaReadyCallback(); //possibly a good idea to skip finalise()
        }

        if(!this.finalised){
            this.finalise();
        }

        let producerReady = false;
        let consumerReady = false;

        const onReady = (type) => {
            switch(type){
                case "producer": producerReady = true; break;
                case "consumer": consumerReady = true; break;
            }

            //consumer && producer
            if(producerReady && consumerReady && kafkaReadyCallback){
                kafkaReadyCallback();
            }

            //consumer only
            if(!this.produceAsTopic && consumerReady && kafkaReadyCallback){
                kafkaReadyCallback();
            }

            //producer only
            if(this.produceAsTopic && producerReady && kafkaReadyCallback && !this.kafka.topic && !this.kafka.topic.length){
                kafkaReadyCallback();
            }
        };

        //overwrite kafka topics
        this.kafka.overwriteTopics(this.topicName);

        this.kafka.on(MESSAGE, msg => {

            if(!this.consumerOpen){
                return;
            }

            super.writeToStream(msg);
        });

        this.kafka.start(() => { onReady("consumer"); }, kafkaErrorCallback, this.produceAsTopic, withBackPressure);

        if(this.produceAsTopic){

            this.kafka.setupProducer(this.outputTopicName, this.outputPartitionsCount, () => { onReady("producer"); },
                kafkaErrorCallback, outputKafkaConfig);

            super.forEach(message => {
                messageProduceHandle(
                    this.kafka,
                    message,
                    this.outputTopicName,
                    this.produceType,
                    this.produceCompressionType,
                    this.produceVersion,
                    kafkaErrorCallback
                );
            });
        }
    }

    /**
     * Emits an output when both input sources have records with the same key.
     * @param {StreamDSL} stream
     * @param {string} key
     */
    innerJoin(stream, key = "key"){
        throw new Error("not implemented yet."); //TODO implement
    }

    /**
     * Emits an output for each record in either input source.
     * If only one source contains a key, the other is null
     * @param {StreamDSL} stream
     */
    outerJoin(stream){
        throw new Error("not implemented yet."); //TODO implement
    }

    /**
     * Emits an output for each record in the left or primary input source.
     * If the other source does not have a value for a given key, it is set to null
     * @param {StreamDSL} stream
     */
    leftJoin(stream){
        throw new Error("not implemented yet."); //TODO implement
    }

    /**
     * write message to the internal stream
     * @param {any} message
     */
    writeToTableStream(message){
        this._tee.emit(MESSAGE, message);
    }

    finalise(buildReadyCallback = null){

        if(this.finalised){
            throw new Error("this KTable has already been finalised.");
        }

        // a KStream is a simple changelog implementation (which StreamDSL delivers by default)
        // a KTable is a table stream representation meaning that only the latest representation of
        // a message must be present

        const lastState = new LastState(this.storage);
        this.asyncMap(lastState.execute.bind(lastState));

        this.stream$.forEach(NOOP).then(_ => {
            //streams until completed
            this.kafka.closeConsumer();
            this.consumerOpen = false;

            if(typeof buildReadyCallback === "function"){
                buildReadyCallback();
            }
        });

        this._bindToTableStream();
        this.finalised = true;
    }

    _bindToTableStream(){
        this.stream$ = most.merge(this.stream$, most.fromEvent(MESSAGE, this._tee));
    }

    /**
     * consume messages until ms passed
     * @param {number} ms
     * @param {function} finishedCallback
     * @returns {KTable}
     */
    consumeUntilMs(ms = 1000, finishedCallback = null){

        super.multicast();
        this.stream$ = this.stream$.until(most.of().delay(ms));

        if(!this.finalised){
            this.finalise(finishedCallback);
        }

        return this;
    }

    /**
     * consume messages until a certain count is reached
     * @param {number} count
     * @param {function} finishedCallback
     * @returns {KTable}
     */
    consumeUntilCount(count = 1000, finishedCallback = null){

        super.multicast();
        this.stream$ = this.stream$.take(count);

        if(!this.finalised){
            this.finalise(finishedCallback);
        }

        return this;
    }

    /**
     * consume messages until latest offset of topic
     * @param {function} finishedCallback
     */
    consumeUntilLatestOffset(finishedCallback = null){

        throw new Error("not implemented yet."); //TODO implement

        /*
         super.multicast();

        if(!this.finalised){
            this.finalise(finishedCallback);
        } */
    }

    /**
     * returns the state of the internal KStorage
     * @returns {Promise<object>}
     */
    getTable(){
        return this.storage.getState();
    }

    /**
     * rewrites content of internal KStorage
     * to the stream, every observer will receive
     * the content as KV {key, value} object
     */
    replay(){
        Object.keys(this.storage.state).forEach(key => {

            const message = {
                key: key,
                value: this.storage.state[key]
            };

            this.writeToTableStream(message);
        });
    }

    /**
     * Emits an output for each record in any of the streams.
     * Acts as simple merge of both streams.
     * can be used with KStream or KTable instances
     * returns a Promise with a NEW KTable instance
     * @param {StreamDSL} stream
     * @returns {Promise.<KTable>}
     */
    merge(stream){

        if(!(stream instanceof StreamDSL)){
            throw new Error("stream has to be an instance of KStream or KTable.");
        }

        //multicast prevents replays
        //create a new internal stream that merges both KStream.stream$s
        const newStream$ = this.stream$.multicast().merge(stream.stream$.multicast());

       return StorageMerger.mergeIntoState([this.getStorage(), stream.getStorage()]).then(mergedState => {
           return this._cloneWith(newStream$, mergedState);
       });
    }

    _cloneWith(newStream$, storageState = {}){

        const kafkaStreams = this._kafkaStreams;
        if(!kafkaStreams){
            throw new Error("merging requires a kafka streams reference on the left-hand merger.");
        }

        const newStorage = kafkaStreams.getStorage();
        const newKafkaClient = kafkaStreams.getKafkaClient();

        return newStorage.setState(storageState).then(_ => {

            const newInstance = new KTable(null, NOOP, newStorage, newKafkaClient, true);
            newInstance.replaceInternalObservable(newStream$);

            return newInstance;
        });
    }

    /**
     * as only joins and window operations return new stream instances
     * you might need a clone sometimes, which can be accomplished
     * using this function
     * @returns {Promise.<KTable>}
     */
    clone(){
        const newStream$ = this.stream$.tap(NOOP);
        return this._cloneWith(newStream$);
    }

    /**
     * closes the internal stream
     * and all kafka open connections
     * as well as KStorage connections
     * @returns {Promise.<boolean>}
     */
    close(){
        this.stream$ = this.stream$.take(0);
        this.stream$ = null;
        this.kafka.close();
        return this.storage.close();
    }
}

module.exports = KTable;
