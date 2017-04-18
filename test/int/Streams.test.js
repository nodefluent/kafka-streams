"use strict";

const assert = require("assert");
const uuid = require("uuid");
const v8 = require("v8");

const {KafkaStreams} = require("./../../index.js");
const config = require("./../test-config.js");

describe("Streams Integration", function() {

    function getMemory(){
        let space = null;
        v8.getHeapSpaceStatistics().forEach(_space => {
            if(_space.space_name === "old_space"){
                space = _space;
            }
        });
        return space.space_used_size;
    }

    const startMemory = getMemory();

    const roundId = process.env.KST_TOPIC || uuid.v4();
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

            stream.writeToStream("hi 1");
            stream.writeToStream("hey 1");
            stream.writeToStream("hi 2");
            stream.writeToStream("hiu 1");
            stream.writeToStream("huu 1");
            stream.writeToStream("hoo 1");
            stream.writeToStream("hi 3");
            stream.writeToStream("hou 1");

            setTimeout(done, 10);
        }, null);
    });

    it("should be able to produce to three topics using a merged stream", function (done) {

        const stream = kafkaStreams.getKStream(null);
        const stream2 = stream.merge(kafkaStreams.getKStream(null));
        const stream3 = stream.merge(kafkaStreams.getKStream(null));

        Promise.all([
            stream.to(secondTopic),
            stream2.to(thirdTopic),
            stream3.to(fourthTopic),
            stream.start() //this one still needs a sync producer
        ]).then(_ => {
            console.log("create stream (1-3) two ready.");

            stream.writeToStream("one 1");
            stream.writeToStream("two 1");
            stream.writeToStream("three 1");
            stream.writeToStream("two 2");
            stream.writeToStream("three 2");
            stream.writeToStream("two 3");

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

        stream
            .mapWrapKafkaPayload()
            .mapStringToKV()
            .filter(kv => kv.key === "one");

        stream2
            .mapWrapKafkaPayload()
            .mapStringToKV()
            .filter(kv => kv.key === "two" || kv.key === "one");

        const stream3 = stream.merge(stream2);
        stream3.countByKey();
        stream3.mapStringify();

        let count = 0;
        stream3.forEach(element => {
            console.log(element);
            count++;
            if(count === 7){
                const data = stream3.storage.state;
                console.log(data);

                assert.equal(data.one, 4);
                assert.equal(data.two, 3);
                assert.equal(data.three, undefined);
                assert.equal(data.four, undefined);

                done();
            }
        });

        Promise.all([
            stream.start(),
            stream2.start()
        ]).then(_ => {
            console.log("streams up");
            stream.writeToStream("one message1");
            stream.writeToStream("one message2");
            stream.writeToStream("one message3");
            stream.writeToStream("four message1");
        })
    });

    it("should be able to consume and join two kafka topics as streams", function(done){

        const firstStream = kafkaStreams.getKStream(inputTopic);
        const secondStream = kafkaStreams.getKStream(secondTopic);

        let messageCount = 0;
        function final(){
            messageCount++;

            if(messageCount > 9){
                throw new Error("more than 9");
            }

            if(messageCount === 9){
                const data = secondStream.storage.state;
                console.log(data);

                assert.equal(data.hi, undefined);
                assert.equal(data.two, 4);

                done();
            }
        }

        firstStream
            .mapWrapKafkaPayload()
            .mapStringToKV()
            .filter(kv => kv.key === "hi");

        secondStream
            .mapWrapKafkaPayload()
            .mapStringToKV()
            .filter(kv => kv.key == "two")
            .countByKey()
            .chainForEach(m => {
              console.log(m);
            });

        const mergedStream = firstStream.merge(secondStream);

        mergedStream
            .mapStringify()
            .tap(v => {
                console.log("cs: " + v);
                final();
            });

        Promise.all([
            firstStream.start(),
            secondStream.start(),
            mergedStream.to(outputTopic, 1)
        ]).then(_ => { //merged has to await a producer being setup

            console.log("merge-stream up");

            firstStream.writeToStream("hi 4");
            firstStream.writeToStream("hi 5");
            secondStream.writeToStream("two 4");
            secondStream.writeToStream("four 1");
        });
    });

    it("should give kafka a few seconds again", function(done){
        setTimeout(done, 1000);
    });

    it("should be able to consume the freshly produced merge topic as table", function(done){

        const stream = kafkaStreams.getKTable(outputTopic, element => {
            return JSON.parse(element.value);
        });

        let messageCount = 0;
        function final(e){

            console.log(e);
            messageCount++;

            if(messageCount > 9){
                throw new Error("more than 8");
            }

            if(messageCount === 9){

                stream.getTable().then(data => {
                    console.log(data);

                    assert.equal(data.hi, "3");
                    assert.equal(data.two, "3");

                    done();
                });
            }
        }

        stream
            .consumeUntilCount(9)
            .tap(e => final(e))
            .forEach(e => {})
            .catch(e => console.error(e));

        stream.start();
    });

    it("should be able to investigate stats for kafka clients", function(done){
       const stats = kafkaStreams.getStats();
        assert.equal(stats.length, 14);
        done();
    });

    it("should be able to consume a decent amount of memory", function(done){
        const consumed = getMemory() - startMemory;
        console.log("consumed additional memory: " + consumed + " bytes");
        assert(consumed < 13.3e6, true);
        done();
    });
});
