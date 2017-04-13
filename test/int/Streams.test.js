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
        done();
    });

    it("should be able to start up a stream to produce some messages", function (done) {

        const stream = kafkaStreams.getKStream(null);
        stream.to(inputTopic);

        stream.start(() => {

            console.log("create stream one ready.");

            stream.writeToStream("hi its me");
            stream.writeToStream("hey is it you");
            stream.writeToStream("hi yes true");
            stream.writeToStream("wow it is");

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
        this.timeout(2100);
        setTimeout(done, 2000);
    });

    it("should be able to consume and join two kafka topics as streams", function(done){
        this.timeout(12000);

        const firstStream = kafkaStreams.getKStream(inputTopic);
        const secondStream = kafkaStreams.getKStream(secondTopic);

        //TODO mode to enable and disable message or message.value as payload of stream event (flat on stream)
        //TODO sinek needs a non JSON mode for message consumption
        //TODO sinek fix offset missing if offset is 0..

        firstStream
            .mapStringToKV(" ", 0, 1)
            //.chainForEach(v => console.log(v))
            .filter(o => o.key === "hi");

        secondStream
            .mapStringToKV()
            //.chainForEach(v => console.log(v))
            .countByKey(); //TODO four seems to be emitted twice count incs per 2

        firstStream
            .chain(secondStream)
            .mapStringify()
            .chainForEach(v => console.log(v))
            .to(outputTopic);

        firstStream.start(() => {
            console.log("first stream up");
            secondStream.start(() => {
                console.log("second stream up");

                firstStream.writeToStream("lol lol");
                secondStream.writeToStream("four 1");
                secondStream.writeToStream("four 2");

                setTimeout(done, 6000);
            });
        });
    });

});