"use strict";

const assert = require("assert");
const proxyquire = require("proxyquire");

const {KafkaFactoryStub} = require("./../utils/KafkaFactoryStub.js");
const KafkaStreams = proxyquire("./../../lib/KafkaStreams.js", {
    "./KafkaFactory.js": KafkaFactoryStub
});

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

        const streams = new KafkaStreams({});
        const source = streams.getKStream("sum-action-unit");

        source
            .map(etl_ValueFlatten)
            .map(etl_KeyValueMapper)
            .take(11)
            .sumByKey("key", "value", "sum")
            .skip(7)
            .map(kv => kv.sum)
            .to("streams-wordcount-output");

        source.start();

        factory.lastConsumer.fakeIncomingMessages([
            "abc 1", "def 1", "abc 3", "fus eins,", "def 4",
            "abc 12", "fus zwei,", "def 100", "abc 50", "ida 0",
            "fus drei"
        ]); // abc 66, def 105, ida 0, fus eins,zwei,drei

        setTimeout(() => {
            const messages = factory.lastProducer.producedMessages;
            console.log(messages);

            const data = source.storage.state;

            assert.equal(data.abc, 66);
            assert.equal(data.def, 105);
            assert.equal(data.ida, 0);
            assert.equal(data.fus, "eins,zwei,drei");

            streams.closeAll();
            done();
        }, 5);
    });
});