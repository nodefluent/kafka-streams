"use strict";

const EventEmitter = require("events");
const most = require("most");
const assert = require("assert");

class FakeKafka extends EventEmitter {

    constructor(){
        super();
    }

    fake(){
        this.emit("message", "one 1");
        this.emit("message","two 1");
        this.emit("message","three 1");
        this.emit("message","two 2");
        this.emit("message","one 2");
        this.emit("message", "two 3");
    }

    fake2(){
        this.emit("message", "hi 1");
        this.emit("message","hu 1");
        this.emit("message","hi 2");
    }
}

describe("Observable2 UNIT", function(){

    it("should be able to observe", function(done){

        const countMap = {};
        function slowKeyCount(value){
            return new Promise(resolve => {

                if(countMap[value.key]){
                    countMap[value.key]++;
                } else {
                    countMap[value.key] = 1;
                }

                resolve({
                    key: value.key,
                    value: value.value,
                    count: countMap[value.key]
                });
            });
        }

        function toKV(m){
            m = m.toLowerCase().split(" ");
            return {
                key: m[0],
                value: m[1]
            };
        }

        const kafka1 = new FakeKafka();
        const kafka2 = new FakeKafka();

        const stream1$ = most.fromEvent("message", kafka1)
            .map(toKV)
            .flatMap(value => most.fromPromise(slowKeyCount(value)))
            .tap(kv => console.log("tap1"))
            .multicast();

        stream1$.forEach(kv => console.log(kv));

        const stream2$ = most.fromEvent("message", kafka2)
            .map(toKV)
            .tap(kv => console.log("tap2"))
            .multicast();

        stream2$.forEach(kv => console.log(kv));

        const stream3$ = stream1$.multicast().merge(stream2$.multicast());

        stream3$.forEach(value => {
            console.log(value);
        });

        setTimeout(() => {
            kafka1.fake();
            kafka2.fake2();
            setTimeout(() => {
                console.log();
                console.log(countMap);

                assert.equal(countMap.one, 2);
                assert.equal(countMap.two, 3);
                assert.equal(countMap.three, 1);

                done();
            }, 50);
        }, 100);
    });
});
