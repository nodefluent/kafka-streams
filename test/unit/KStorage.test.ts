import { EventEmitter } from "events";
import { KStorage } from "../../src/lib/KStorage";
import * as proxyquire from "proxyquire";
import * as assert from "assert";
import * as most from "most";

class FakeKafka extends EventEmitter {
  constructor () {
    super();
  }
}

describe("KStorage UNIT", function () {
  it("should store incoming values under corresponding keys, and unsubscribe when closed", function (done) {
    const kafka = new FakeKafka();
    const store = new KStorage({});
    const stream$ = most.fromEvent("message", kafka)
      .map((value: any) => value.toLowerCase().split(" "))
      .map(value => ({ key: value[0], "value": value[1] }))
      .recoverWith(e => {
        console.error(e);
        return most.empty();
      });

    store.start(stream$.subscribe(store));
    stream$.forEach(value => console.log(value));

    kafka.emit("message", "key1 value1");
    kafka.emit("message", "key2 value2");

    setTimeout(() => {
      store.close();
      kafka.emit("message", "key3 value3");

      setTimeout(() => {
        store
          .get("key1")
          .then(v => assert.equal(v, "value1"))
          .catch(e => console.error(e));

        store
          .get("key2")
          .then(v => assert.equal(v, "value2"))
          .catch(e => console.error(e));

        store
          .get("key3")
          .then(v => assert.equal(v, undefined))
          .catch(e => console.error(e));

        done();
      });
    });
  });
});
