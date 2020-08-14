"use strict";

const assert = require("assert");
const proxyquire = require("proxyquire");

const { KafkaFactoryStub } = require("./../utils/KafkaFactoryStub.js");
const { Buffer } = require("buffer");
const KafkaStreams = proxyquire("./../../lib/KafkaStreams.js", {
    "./KafkaFactory.js": KafkaFactoryStub
});

describe("KStream UNIT", function () {

    describe("KStream branching", function () {

        it("should be able to branch kstream into kstreams", function (done) {

            const factory = new KafkaFactoryStub();
            const streams = new KafkaStreams({});

            const parent = streams.getKStream(null);

            const [
                streamA,
                streamB,
                streamTrue
            ] = parent
                    .mapJSONConvenience()
                    .mapWrapKafkaValue()
                    .branch([
                        (message) => message.name.startsWith("a"),
                        (message) => message.name.startsWith("b"),
                        (message) => !!message
                    ]);

            const outputA = [];
            streamA.forEach((a) => outputA.push(a));

            const outputB = [];
            streamB.forEach((b) => outputB.push(b));

            const outputTrue = [];
            streamTrue.forEach((t) => outputTrue.push(t));

            const outputParent = [];
            parent.forEach((p) => outputParent.push(p));

            function makeKafkaLikeMessage(string) {
                return { value: Buffer.from(JSON.stringify({ name: string })) }
            }

            const parentMessages = [
                "albert",
                "bunert",
                "brabert",
                "anna",
                "anne",
                "ansgar",
                "carsten",
                "beter",
                "christina",
                "bolf",
                "achim"
            ].map(makeKafkaLikeMessage);

            setTimeout(() => {
                parent.writeToStream(makeKafkaLikeMessage("alina"));
                parent.writeToStream(makeKafkaLikeMessage("bela"));
            }, 15);

            parentMessages.forEach(m => parent.writeToStream(m));

            setTimeout(() => {

                assert.equal(outputA.length, 6);
                assert.equal(outputB.length, 5);
                assert.equal(outputTrue.length, parentMessages.length + 2);
                assert.equal(outputParent.length, parentMessages.length + 2);

                done();
            }, 20);
        });
    })
});
