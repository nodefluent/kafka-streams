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
            "derp 1", "derp 2", "derpa 1", "derp 3",
            "derpb 1", "derp 4"
        ]);

        let intervalCount = 0;
        const intv = setInterval(() => {
            intervalCount++;
            factory.lastConsumer.fakeIncomingMessages([
                "derpa " + intervalCount * 2, "derp "  + intervalCount * 3, "derpb " + intervalCount * 4
            ]);
        }, 2);

        setTimeout(clearInterval, 20, intv);
        setTimeout(() => {
            const messages = factory.lastProducer.producedMessages;
            //console.log(messages);

            const data = source.getTable();
            console.log(data);

            assert.equal(data.derp, 15);
            assert.equal(data.derpa, 10);
            assert.equal(data.derpb, 16);

            const replays = {};

            source.forEach(kv => {
                console.log(kv);
                replays[kv.key] = kv.value;
                if(Object.keys(replays).length === 3){

                    assert.equal(replays.derp, 15);
                    assert.equal(replays.derpa, 10);
                    assert.equal(replays.derpb, 16);

                    streams.close();
                    done();
                }
            }).catch(e => {
                console.error(e);
            });

            source.replay();

        }, 100);
    });
});