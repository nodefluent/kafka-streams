"use strict";

const assert = require("assert");
const proxyquire = require("proxyquire");

const {KafkaFactoryStub} = require("./../utils/KafkaFactoryStub.js");
const KafkaStreams = proxyquire("./../../lib/KafkaStreams.js", {
    "./KafkaFactory.js": KafkaFactoryStub
});

describe("WordCount UNIT", function() {

    it("should be able to count words", function (done) {

        const factory = new KafkaFactoryStub();

        function etl_ValueFlatten(value){
            return value.toLowerCase().split(" ");
        }

        function etl_KeyValueMapper(elements){
            return {
                key: elements[0],
                value: elements[1]
            };
        }

        function etl_deflate(value){
            return value.count;
        }

        const streams = new KafkaStreams({});
        const source = streams.getKStream("word-count-unit");

        source
            .map(etl_ValueFlatten)
            .map(etl_KeyValueMapper)
            .countByKey("key", "count")
            .skip(7)
            .take(3)
            .map(etl_deflate)
            .to("streams-wordcount-output");

        source.start();

        factory.lastConsumer.fakeIncomingMessages([
           "if bla", "if xta", "bla 1", "if blup",
            "blup 2", "if hihi", "bla 2", "if five",
            "bla third", "blup second derp"
        ]); // if = 5, bla = 3, blup = 2

        setTimeout(() => {
            const messages = factory.lastProducer.producedMessages;
            console.log(messages);

            assert.equal(messages[0], 5); //if
            assert.equal(messages[1], 3); //bla
            assert.equal(messages[2], 2); //blup

            streams.closeAll();
            done();
        }, 5);
    });
});