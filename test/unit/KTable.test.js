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
            .consumeUntilCount(20)
            .to("streams-wordcount-output");

        const streams = new KafkaStreams(source, {});
        streams.start();

        factory.lastConsumer.fakeIncomingMessages([
            "if 1", "if 2", "bla 1", "if 3",
            "blup 1", "if 4"
        ]);

        let intervalCount = 0;
        setInterval(() => {
            intervalCount++;
            factory.lastConsumer.fakeIncomingMessages([
                "bla " + intervalCount * 2, "if "  + intervalCount * 3, "blup " + intervalCount * 4
            ]);
        }, 2);

        setTimeout(() => {
            const messages = factory.lastProducer.producedMessages;
            //console.log(messages);

            const data = source.getTable();
            console.log(data);

            assert.equal(data.if, 15);
            assert.equal(data.bla, 10);
            assert.equal(data.blup, 16);

            source.forEach(kv => console.log(kv));
            source.replay();

            streams.close();
            done();
        }, 100);
    });
});