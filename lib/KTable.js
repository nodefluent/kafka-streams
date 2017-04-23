"use strict";

const EventEmitter = require("events");
const most = require("most");
const Promise = require("bluebird");

const StreamDSL = require("./StreamDSL.js");
const {LastState} = require("./actions");
const KStream = require("./KStream.js");
const StorageMerger = require("./StorageMerger.js");

const MESSAGE = "message";
const NOOP = () => {};

class KTable extends StreamDSL {

    /**
     * creates a table representation of a stream
     * join operations of ktable instances are asynchronous
     * and return promises
     * keyMapETL = v -> {key, value} (sync)
     * @param topicName
     * @param keyMapETL
     * @param storage
     * @param kafka
     * @param isClone
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
     * @param kafkaReadyCallback
     * @param kafkaErrorCallback
     * @param withBackPressure
     */
    start(kafkaReadyCallback = null, kafkaErrorCallback = null, withBackPressure = false){

        if(arguments.length < 2){
            return new Promise(resolve => {
                this._start(resolve, kafkaErrorCallback, withBackPressure);
            });
        }

        return this._start(kafkaReadyCallback, kafkaErrorCallback, withBackPressure);
    }

    _start(kafkaReadyCallback = null, kafkaErrorCallback = null, withBackPressure){

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
            if(this.produceAsTopic && producerReady && kafkaReadyCallback && !this.kafka.topic){
                kafkaReadyCallback();
            }
        };

        this.kafka.on(MESSAGE, msg => {

            if(!this.consumerOpen){
                return;
            }

            super.writeToStream(msg);
        });

        this.kafka.start(() => { onReady("consumer"); }, kafkaErrorCallback, this.produceAsTopic, withBackPressure);

        if(this.produceAsTopic){

            this.kafka.setupProducer(this.outputTopicName, this.outputPartitionsCount, () => { onReady("producer"); },
                kafkaErrorCallback);

            super.forEach(message => {

                let promise = null;
                switch(this.produceType){

                    case this.PRODUCE_TYPES.SEND:
                        promise = this.kafka.send(this.outputTopicName, message);
                        break;

                    case this.PRODUCE_TYPES.BUFFER:
                        promise = this.kafka.buffer(this.outputTopicName, null, message, this.produceCompressionType);
                        break;

                    case this.PRODUCE_TYPES.BUFFER_FORMAT:
                        promise = this.kafka.bufferFormat(this.outputTopicName, null, message, this.produceVersion,
                            this.produceCompressionType);
                        break;

                    default:
                        throw new Error(`${this.produceType} is an unknown produceType.`);
                }

                promise.catch(e => {
                    if(kafkaErrorCallback){
                        kafkaErrorCallback(e);
                    }
                });
            });

        }
    }

    /**
     * Emits an output when both input sources have records with the same key.
     * @param stream
     * @param key
     */
    innerJoin(stream, key = "key"){
        //TODO
    }

    /**
     * Emits an output for each record in either input source.
     * If only one source contains a key, the other is null
     * @param stream
     */
    outerJoin(stream){
        //TODO
    }

    /**
     * Emits an output for each record in the left or primary input source.
     * If the other source does not have a value for a given key, it is set to null
     * @param stream
     */
    leftJoin(stream){
        //TODO
    }

    writeToTableStream(message){
        this._tee.emit(MESSAGE, message);
    }

    finalise(){

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
            //TODO maybe close kafka-consumer here?
            this.consumerOpen = false;
        });

        this._bindToTableStream();
        this.finalised = true;
    }

    _bindToTableStream(){
        this.stream$ = most.merge(this.stream$, most.fromEvent(MESSAGE, this._tee));
    }

    consumeUntilMs(ms = 1000){

        this.stream$ = this.stream$.until(most.of().delay(ms));

        if(!this.finalised){
            this.finalise();
        }

        return this;
    }

    consumeUntilCount(count = 1000){

        this.stream$ = this.stream$.take(count);

        if(!this.finalised){
            this.finalise();
        }

        return this;
    }

    consumeUntilLatestOffset(){

        //TODO

        if(!this.finalised){
            this.finalise();
        }
    }

    getTable(){
        return this.storage.getState();
    }

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
     * @param stream
     * @returns Promise.{KTable}
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
     * @returns Promise.{KTable}
     */
    clone(){
        const newStream$ = this.stream$.tap(NOOP);
        return this._cloneWith(newStream$);
    }

    close(){
        this.kafka.close();
    }
}

module.exports = KTable;
