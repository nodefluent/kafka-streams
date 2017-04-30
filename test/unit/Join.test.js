"use strict";

const assert = require("assert");
const proxyquire = require("proxyquire");

const {KafkaFactoryStub} = require("./../utils/KafkaFactoryStub.js");
const KafkaStreams = proxyquire("./../../lib/KafkaStreams.js", {
    "./KafkaFactory.js": KafkaFactoryStub
});

describe("Join UNIT", function() {

    describe("KStream <-> KStream", function(){

        it("should be able to inner join kstreams", function (done) {

            const factory = new KafkaFactoryStub();
            const streams = new KafkaStreams({});

            const parent = streams.getKStream(null);
            parent
                .mapStringToKV()
                .map(event => {
                    if(event && event.key == "other"){
                        event.otherKey = event.key;
                    }
                    return event;
                });

            const side = streams.getKStream(null);
            side
                .mapStringToKV()
                .map(event => {
                    if(event && event.key == "other"){
                        event.otherKey = event.key;
                    }
                    return event;
                });

            const joined = parent.innerJoin(side, "otherKey");
            joined.to("some-output-topic");

            const parentMessages = [
                "other x1",
                null,
                "",
                undefined,
                "other x2",
                "else",
                "whatelse",
                "other x3"
            ];

            const sideMessages = [
                "wut",
                "wat",
                null,
                "",
                undefined,
                "other x1",
                "else"
            ];

            setTimeout(() => {
                side.writeToStream("other x2");
                side.writeToStream("other x3");
            }, 15);

            parentMessages.forEach(m => parent.writeToStream(m));
            sideMessages.forEach(m => side.writeToStream(m));

            setTimeout(() => {
                const messages = factory.lastProducer.producedMessages;
                console.log(messages);

                assert.equal(messages[0].left.value, "x1");
                assert.equal(messages[0].left.value, messages[0].right.value);

                assert.equal(messages[1].left.value, "x2");
                assert.equal(messages[1].left.value, messages[1].right.value);

                assert.equal(messages[2].left.value, "x3");
                assert.equal(messages[2].left.value, messages[2].right.value);

                done();
            }, 20);
        });
    })
});
