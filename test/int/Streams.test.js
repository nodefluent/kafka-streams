"use strict";

const assert = require("assert");
const uuid = require("uuid");

const {KafkaStreams} = require("./../../index.js");
const config = require("./../test-config.js");

describe("Streams Integration", function() {

    const roundId = uuid.v4();
    const inputTopic = "ks-input-" + roundId;
    const secondTopic = "ks-second-" + roundId;
    const thirdTopic = "ks-third-" + roundId;
    const fourthTopic = "ks-fourth-" + roundId;
    const outputTopic = "ks-output-" + roundId;

    const kafkaStreams = new KafkaStreams(config);

    after(function(done){
        kafkaStreams.closeAll();
        console.log(`topic roundId: ks-*-${roundId}.`);
        setTimeout(done, 500);
    });

    it("should be able to produce messages to topic", function (done) {

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
        }, null);
    });

    it("should be able to produce to two topics using a merged stream", function (done) {

        const stream = kafkaStreams.getKStream(null);
        const stream2 = stream.merge(kafkaStreams.getKStream(null));
        const stream3 = stream.merge(kafkaStreams.getKStream(null));

        Promise.all([
            stream.to(secondTopic),
            stream2.to(thirdTopic),
            stream3.to(fourthTopic),
            stream.start()
        ]).then(_ => {
            console.log("create stream (1-3) two ready.");

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

    it("should be able to count keys on third topic", function(done){

        const stream = kafkaStreams.getKStream(thirdTopic);

        let count = 0;
        stream
            .mapWrapKafkaPayload()
            .mapStringToKV()
            .countByKey()
            .forEach(_ => {
                count++;
                if(count === 6){
                    const data = stream.storage.state;
                    console.log(data);

                    assert.equal(data.one, 1);
                    assert.equal(data.two, 3);
                    assert.equal(data.three, 2);

                    done();
                }
            });

        stream.start();
    });

    it("should be able to count keys on fourth topic joining a local stream", function(done){

        const stream = kafkaStreams.getKStream(null);
        const stream2 = kafkaStreams.getKStream(fourthTopic);

        stream2
            .mapWrapKafkaPayload()
            .mapStringToKV()
            .countByKey();

        const stream3 = stream.merge(stream2);

        let count = 0;
        stream3.forEach(element => {
            console.log(element);
            count++;
            if(count === 8){
                const data = stream2.storage.state;
                console.log(data);

                assert.equal(data.one, 1);
                assert.equal(data.two, 3);
                assert.equal(data.three, 2);

                done();
            }
        });

        Promise.all([
            stream.start(),
            stream2.start()
        ]).then(_ => {
            console.log("streams up");
            stream.writeToStream("a message");
            stream.writeToStream("another message");
        })
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
            //.chainForEach(v => console.log("1s: " + v))
            .mapStringToKV(" ", 0, 1)
            .filter(o => o.key === "hi");

        secondStream
            .mapWrapKafkaPayload()
            //.chainForEach(v => console.log("2s: " + v))
            .mapStringToKV()
            .countByKey();
            //.forEach(v => console.log("2r: " + JSON.stringify(v)));

        const mergedStream = firstStream.merge(secondStream);

        mergedStream
            .mapStringify()
            .chainForEach(v => {
                console.log("cs: " + v);
                final();
            });

        Promise.all([
            firstStream.start(),
            secondStream.start(),
            mergedStream.to(outputTopic, 1)
        ]).then(_ => { //merged has to await a producer being setup

            console.log("merge-stream up");

            firstStream.writeToStream("lol lol");
            secondStream.writeToStream("four 1");
            secondStream.writeToStream("four 2");
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
        function final(e){
            console.log(e);
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
            .forEach(e => final(e))
            .catch(e => console.error(e));

        stream.start();
    });

    it("should be able to investigate stats for kafka clients", function(done){
       const stats = kafkaStreams.getStats();
        assert.equal(stats.length, 14);
        done();
    });
});