"use strict";

const assert = require("assert");
const uuid = require("uuid");

const {KafkaStreams} = require("./../../index.js");
const config = require("./../test-config.js");

describe("Streams Integration", function() {

    const inputTopic = "ks-input-" + uuid.v4();
    const secondTopic = "ks-second-" + uuid.v4();
    const outputTopic = "ks-output-" + uuid.v4();

    const kafkaStreams = new KafkaStreams(config);

    after(function(done){
        kafkaStreams.closeAll();
        setTimeout(done, 500);
    });

    it("should be able to start up a stream to produce some messages", function (done) {

        const stream = kafkaStreams.getKStream(null);
        stream.to(inputTopic);

        stream.start(() => {

            console.log("create stream one ready.");

            stream.writeToStream("hi its me");
            stream.writeToStream("hey is it you");
            stream.writeToStream("hi yes true");
            stream.writeToStream("hiu it is");
            stream.writeToStream("huu it is");
            stream.writeToStream("hoo it is");
            stream.writeToStream("hi too here");
            stream.writeToStream("hou it is");

            setTimeout(done, 10);
        });
    });

    it("should be able to start up a second stream to produce some more messages", function (done) {

        const stream = kafkaStreams.getKStream(null);
        stream.to(secondTopic);

        stream.start(() => {

            console.log("create stream two ready.");

            stream.writeToStream("one 1");
            stream.writeToStream("two 2");
            stream.writeToStream("three 3");
            stream.writeToStream("two 2");
            stream.writeToStream("three 3");
            stream.writeToStream("two 2");

            setTimeout(done, 10);
        });
    });

    it("should give kafka a few seconds", function(done){
        setTimeout(done, 1000);
    });

    it("should be able to consume and join two kafka topics as streams", function(done){
        this.timeout(5000);

        let messageCount = 0;
        function final(){
            messageCount++;
            if(messageCount > 11){
                throw new Error("more than 11");
            }
            if(messageCount === 11){
                done();
            }
        }

        const firstStream = kafkaStreams.getKStream(inputTopic);
        const secondStream = kafkaStreams.getKStream(secondTopic);

        firstStream
            .mapWrapKafkaPayload()
            .chainForEach(v => console.log("1s: " + v))
            .mapStringToKV(" ", 0, 1)
            .filter(o => o.key === "hi");

        secondStream
            .mapWrapKafkaPayload()
            .chainForEach(v => console.log("2s: " + v))
            .mapStringToKV()
            .countByKey();

        const mergedStream = firstStream.chain(secondStream);

        mergedStream
            .mapStringify()
            .chainForEach(v => {
                console.log("cs: " + v);
                final();
            })
            .to(outputTopic, 1, () => { //merged has to await a producer being setup

                console.log("merge-stream producer up");

                firstStream.start(() => {
                    console.log("first stream up");
                    secondStream.start(() => {
                        console.log("second stream up");

                        firstStream.writeToStream("lol lol");
                        secondStream.writeToStream("four 1");
                        secondStream.writeToStream("four 2");
                    });
                });
            });
    });

    it("should give kafka a few seconds again", function(done){
        setTimeout(done, 1000);
    });

    it("should be able to consume the freshly produced merge topic", function(done){

        const stream = kafkaStreams.getKTable(outputTopic, element => {
            return JSON.parse(element.value);
        });

        let messageCount = 0;
        function final(){
            messageCount++;
            if(messageCount > 11){
                throw new Error("more than 11");
            }
            if(messageCount === 11){

                //TODO table is empty, assert values here
                const data = stream.getTable();
                console.log(data);

                assert.equal(data.four, 2);
                assert.equal(data.hi, "too");
                assert.equal(data.one, 1);
                assert.equal(data.two, 3);
                assert.equal(data.three, 2);

                done();
            }
        }

        stream
            .consumeUntilCount(11)
            .forEach(e => final())
            .catch(e => console.error(e));

        stream.start();
    });
});