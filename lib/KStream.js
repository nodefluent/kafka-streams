"use strict";

const Promise = require("bluebird");
const {async: createSubject} = require("most-subject");

const StreamDSL = require("./StreamDSL.js");
const KTable = require("./KTable.js");
const {Window} = require("./actions");

const NOOP = () => {};

class KStream extends StreamDSL {

    /**
     * creates a changelog representation of a stream
     * join operations of kstream instances are synchronous
     * and return new instances immediately
     * @param topicName
     * @param storage
     * @param kafka
     * @param isClone
     */
    constructor(topicName, storage = null, kafka = null, isClone = false) {
        super(topicName, storage, kafka, isClone);

        this.started = false;

        //readability
        if(isClone){
            this.started = true;
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
                this._start(resolve, kafkaReadyCallback, withBackPressure);
            });
        }

        return this._start(kafkaReadyCallback, kafkaErrorCallback, withBackPressure);
    }

    _start(kafkaReadyCallback = null, kafkaErrorCallback = null, withBackPressure){

        if(this.started){
            throw new Error("this KStream is already started.");
        }

        this.started = true;

        if(!this.topicName && !this.produceAsTopic){
            return kafkaReadyCallback();
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

        this.kafka.on("message", msg => super.writeToStream(msg));
        this.kafka.start(() => { onReady("consumer"); }, kafkaErrorCallback || NOOP, this.produceAsTopic, withBackPressure);

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

    /**
     * Emits an output for each record in any of the streams.
     * Acts as simple merge of both streams.
     * can be used with KStream or KTable instances
     * returns a NEW KStream instance
     * @param stream
     * @returns {KStream}
     */
    merge(stream){

        if(!(stream instanceof StreamDSL)){
            throw new Error("stream has to be an instance of KStream or KTable.");
        }

        //multicast prevents replays
        //create a new internal stream that merges both KStream.stream$s
        const newStream$ = this.stream$.multicast().merge(stream.stream$.multicast());
        return this._cloneWith(newStream$);
    }

    _cloneWith(newStream$){

        const kafkaStreams = this._kafkaStreams;
        if(!kafkaStreams){
            throw new Error("merging requires a kafka streams reference on the left-hand merger.");
        }

        const newStorage = kafkaStreams.getStorage();
        const newKafkaClient = kafkaStreams.getKafkaClient();

        const newInstance = new KStream(null, newStorage, newKafkaClient, true);
        newInstance.replaceInternalObservable(newStream$);

        return newInstance;
    }

    /**
     * as only joins and window operations return new stream instances
     * you might need a clone sometimes, which can be accomplished
     * using this function
     * @returns {KStream}
     */
    clone(){
        const newStream$ = this.stream$.tap(NOOP);
        return this._cloneWith(newStream$);
    }

    /**
     * builds a window'ed stream across all events of the current kstream
     * when the first event with an exceeding "to" is received (or the abort()
     * callback is called) the window closes and emits its "collected" values to the
     * returned kstream
     * from and to must be unix epoch timestamps in milliseconds (Date.now())
     * etl can be a function that should return the timestamp (event time) of
     * from within the message e.g. m -> m.payload.createdAt
     * if etl is not given, a timestamp of receiving will be used (processing time)
     * for each event
     * encapsulated refers to the result messages (defaults to true, they will be
     * encapsulated in an object: {time, value}
     * @param from
     * @param to
     * @param etl
     * @param encapsulated
     * @returns {{window: *, abort: abort, stream: *}}
     */
    window(from, to, etl = null, encapsulated = true) {

        if(typeof from !== "number" || typeof to !== "number"){
            throw new Error("from & to should be unix epoch ms times.");
        }

        //use this.stream$ as base, but work on a new one
        let stream$ = null;
        if(!etl){
            stream$ = this.stream$.timestamp();
        } else {
            stream$ = this.stream$.map(element => {
                return {
                    time: etl(element),
                    value: element
                };
            });
        }

        const abort$ = createSubject();

        function abort(){
            abort$.next(null);
        }

        const window = new Window([]);
        stream$
            .skipWhile(event => event.time < from)
            .takeWhile(event => event.time < to)
            .until(abort$)
            .tap(event => window.execute(event, encapsulated))
            .drain().then(_ => {
                window.writeToStream();
            })
            .catch(e => window.getStream().error(e));

        return {
            window,
            abort,
            stream: this._cloneWith(window.getStream())
        };
    }

    close(){
        this.kafka.close();
    }
}

module.exports = KStream;
