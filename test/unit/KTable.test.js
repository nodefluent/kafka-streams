"use strict";

const assert = require("assert");
const proxyquire = require("proxyquire");

const {KafkaFactoryStub} = require("./../utils/KafkaFactoryStub.js");
const KafkaStreams = proxyquire("./../../lib/KafkaStreams.js", {
    "./KafkaFactory.js": KafkaFactoryStub
});

const {KTable} = require("./../../index.js");

describe("KTable UNIT", function() {

    it("should be able to represent a table from a stream", function (done) {

        const factory = new KafkaFactoryStub();

        function etl_KeyValueMapper(message){
            const elements = message.toLowerCase().split(" ");
            return {
                key: elements[0],
                value: elements[1]
            };
        }

        const source = new KTable("streams-file-input", etl_KeyValueMapper);

        source
            .consumeUntilCount(7)
            .to("streams-wordcount-output");

        const streams = new KafkaStreams(source, {});
        streams.start();

        factory.lastConsumer.fakeIncomingMessages([
            "if 1", "if 2", "bla 1", "if 3",
            "blup 1", "if 4"
        ]);

        setInterval(() => {
            factory.lastConsumer.fakeIncomingMessages([
                "bla 2", "if 5",
                "bla 3", "blup 2"
            ]);
        }, 5);

        setTimeout(() => {
            const messages = factory.lastProducer.producedMessages;
            console.log(messages);

            const data = source.getTable();
            console.log(data);

            const tableStream = source.getStream();
            tableStream.forEach(console.log);
            source.replay();

            assert.equal(data.if, 4);
            assert.equal(data.bla, 2);
            assert.equal(data.blup, 1);

            streams.close();
            done();
        }, 100);
    });
});