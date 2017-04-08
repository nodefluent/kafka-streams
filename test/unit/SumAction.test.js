"use strict";

const assert = require("assert");
const proxyquire = require("proxyquire");

const {KafkaFactoryStub} = require("./../utils/KafkaFactoryStub.js");
const KafkaStreams = proxyquire("./../../lib/KafkaStreams.js", {
    "./KafkaFactory.js": KafkaFactoryStub
});

const {KStream} = require("./../../index.js");

describe("Sum-Action UNIT", function() {

    it("should be able to sum values", function (done) {

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

        const source = new KStream("streams-file-input");

        source
            .map(etl_ValueFlatten)
            .map(etl_KeyValueMapper)
            .take(4)
            .sumByKey("key", "value")
            .to("streams-wordcount-output");

        const streams = new KafkaStreams(source, {});
        streams.start();

        factory.lastConsumer.fakeIncomingMessages([
            "abc 1", "def 1", "abc 3", "def 4"
        ]); // abc 4, def 5

        setTimeout(() => {
            const messages = factory.lastProducer.producedMessages;
            console.log(messages);

            const data = source.storage.state;

            assert.equal(data.abc, 4);
            assert.equal(data.def, 5);

            streams.close();
            done();
        }, 5);
    });
});