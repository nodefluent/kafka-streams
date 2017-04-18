"use strict";

const Promise = require("bluebird");

const StreamDSL = require("./StreamDSL.js");
const KTable = require("./KTable.js");
const {Window} = require("./actions");

const NOOP = () => {};

class KStream extends StreamDSL {

    constructor(topicName, storage = null, kafka = null, isClone = false) {
        super(topicName, storage, kafka, isClone);

        this.started = false;
    }

    /**
     * start kafka consumption
     * prepare production of messages if necessary
     * when called with zero or just a single callback argument
     * this function will return a promise and use the callback for errors
     * @param kafkaReadyCallback
     * @param kafkaErrorCallback
     */
    start(kafkaReadyCallback = null, kafkaErrorCallback = null){

        if(arguments.length < 2){
            return new Promise(resolve => {
                this._start(resolve, kafkaReadyCallback);
            });
        }

        return this._start(kafkaReadyCallback, kafkaErrorCallback);
    }

    _start(kafkaReadyCallback = null, kafkaErrorCallback = null){

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
        this.kafka.start(() => { onReady("consumer"); }, kafkaErrorCallback || NOOP, this.produceAsTopic);

        if(this.produceAsTopic){
            this.kafka.setupProducer(this.outputTopicName, this.outputPartitionsCount, () => { onReady("producer"); }, kafkaErrorCallback);
            super.forEach(message => {
                this.kafka.send(this.outputTopicName, message).catch(e => {
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

        const kafkaStreams = this._kafkaStreams;
        if(!kafkaStreams){
            throw new Error("merging requires a kafka streams reference on the left-hand merger.");
        }

        //multicast prevents replays
        //create a new internal stream that merges both KStream.stream$s
        const newStream$ = this.stream$.multicast().merge(stream.stream$.multicast());

        const newStorage = kafkaStreams.getStorage();
        const newKafkaClient = kafkaStreams.getKafkaClient();

        const newInstance = new KStream(null, newStorage, newKafkaClient, true);
        newInstance.replaceInternalObservable(newStream$);

        return newInstance;
    }

		window(from, to, etl, aggregate) {

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

			const window = new Window([]);
			stream$
				.filter(event => event.time >= from && event.time < to)
				.tap(window.execute.bind(window));



		}




    close(){
        this.kafka.close();
    }
}

module.exports = KStream;
