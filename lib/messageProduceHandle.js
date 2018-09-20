"use strict";

const debug = require("debug")("kafka-streams:mph");
const PRODUCE_TYPES = require("./produceTypes.js");

/**
 * returns true if the message is an object
 * with key and value fields
 * @param message {Object}
 * @returns {boolean}
 */
const hasKVStructure = message => {

    if(message &&
        typeof message === "object" &&
        typeof message.key !== "undefined" &&
        typeof message.value !== "undefined"){
        return true;
    }

    return false;
};

/**
 * wraps a kafka message in the correct type format to its
 * kafka (js or native) instance method's promise return value
 * @param produceType
 * @param kafka
 * @param compressionType
 * @param topic
 * @param partition
 * @param key
 * @param value
 * @param partitionKey - optional
 * @param opaqueKey - optional
 * @param version - optional
 * @returns {Promise<void>}
 */
const produceTypeSelection = (produceType, kafka, compressionType, topic, partition, key, value, partitionKey = null, opaqueKey = null, version = 1) => {

    debug("producing", produceType, topic, partition, key, partitionKey, opaqueKey, version, value);

    //compressionType is only passed for the JS client, the native client will ignore it
    //on the other hand partitionKey, opaqueKey and partition are ignored by the JS client

    let promise = null;
    switch(produceType){

        case PRODUCE_TYPES.SEND:
            promise = kafka.send(topic, value, partition, key, partitionKey, opaqueKey);
            break;

        case PRODUCE_TYPES.BUFFER:
            promise = kafka.buffer(topic, key, value, compressionType, partition, version, partitionKey);
            break;

        case PRODUCE_TYPES.BUFFER_FORMAT:
            promise = kafka.bufferFormat(topic, key, value, version, compressionType, partitionKey, partition);
            break;

        default:
            throw new Error(`${produceType} is an unknown produceType.`);
    }

    return promise;
};

/**
 * This method handles any outgoing event from a stream
 * producing it to kafka (if the .to dsl was used)
 * @param kafka
 * @param message
 * @param outputTopicName
 * @param produceType
 * @param compressionType
 * @param version
 * @param producerErrorCallback
 * @return {Promise<void>}
 */
const messageProduceHandle = (kafka, message, outputTopicName, produceType, compressionType, version, producerErrorCallback) => {

    let _topic = outputTopicName;
    let _key = null;
    let _version = version;
    let _partition = null;
    let _partitionKey = null;
    let _opaqueKey = null;
    let _value = message;

    //overwrite default values or configured values
    //with on demand message settings
    if(hasKVStructure(message)){

        _key = message.key;

        //overwrite default topic, with per messag topic
        if(message.topic){
            _topic = message.topic;
        }

        if(typeof message.version !== "undefined"){
            _version = message.version;
        }

        if(typeof message.partition !== "undefined"){
            _partition = message.partition;
        }

        if(typeof message.partitionKey !== "undefined"){
            _partitionKey = message.partitionKey;
        }

        if(typeof message.opaqueKey !== "undefined"){
            _opaqueKey = message.opaqueKey;
        }

        _value = message.value;
    }

    const kafkaMessage = {
        produceType,
        compressionType,
        topic: _topic,
        partition: _partition,
        key: _key,
        value: _value,
        partitionKey: _partitionKey,
        opaqueKey: _opaqueKey
    };

    const produceHandler = kafka.getProduceHandler();
    if(produceHandler){
        produceHandler.emit("produced", kafkaMessage);
    }

    return produceTypeSelection(

        produceType,
        kafka,
        compressionType,

        _topic,
        _partition,
        _key,
        _value,
        _partitionKey,
        _opaqueKey,
        _version

    ).then(() => {
        if(produceHandler){
            produceHandler.emit("delivered", kafkaMessage);
        }
    }).catch(error => {
        if(producerErrorCallback){
            producerErrorCallback(error);
        }
    });
};

module.exports = {
    messageProduceHandle
};
