import * as assert from "assert";
import * as proxyquire from "proxyquire";
import KafkaFactoryStub from "../utils/KafkaFactoryStub";

const { KafkaStreams } = proxyquire("../../src/lib/KafkaStreams", {
  "./KafkaFactory": { KafkaFactory: KafkaFactoryStub }
});

describe("KTable UNIT", function () {

  it("should be able to represent a table from a stream", function (done) {

    function etl_KeyValueMapper(message) {
      const elements = message.toLowerCase().split(" ");
      return {
        key: elements[0],
        value: elements[1]
      };
    }

    let intv = null;
    let count = 0;
    let hit = 0;
    let hitCount = 0;

    const streams = new KafkaStreams({});
    const factory = streams.factory;
    const source = streams.getKTable("ktable-unit", etl_KeyValueMapper);

    source
      .tap(_ => {
        count++;
      })
      .consumeUntilCount(21, () => {

        assert.equal(count, 21);
        assert.equal(hit, 1);
        assert.equal(hitCount - 5 >= 0, true);

        const messages = factory.lastProducer.producedMessages;
        //console.log(messages);

        source.getTable().then((data: any)=> {

          console.log(data);

          assert.equal(data.derp, 7);
          assert.equal(data.derpa, 7);
          assert.equal(data.derpb, 7);

          const replays = {} as any;

          source.forEach(kv => {
            console.log(kv);
            replays[kv.key] = kv.value;
            if (Object.keys(replays).length === 3) {

              assert.equal(replays.derp, 7);
              assert.equal(replays.derpa, 7);
              assert.equal(replays.derpb, 7);

              streams.closeAll();
              clearInterval(intv);
              done();
            }
          });

          source.replay();
        });
      })
      .atThroughput(5, () => {
        hit++;
        hitCount = count;
      })
      .tap(console.log)
      .to("streams-wordcount-output");

    source.start();

    let intervalCount = 0;
    intv = setInterval(() => {
      intervalCount++;
      factory.lastConsumer.fakeIncomingMessages([
        "derpa " + intervalCount, "derp " + intervalCount, "derpb " + intervalCount
      ]);
    }, 2);
  });
});
