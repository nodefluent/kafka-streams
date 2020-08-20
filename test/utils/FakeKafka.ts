import { Promise } from "bluebird";
import { JSKafkaClient } from "../../src/lib/client";

export default class FakeKafka extends JSKafkaClient {

  public producedMessages = [];
  public topic: string;

  constructor(topic, config = {}) {
    super(topic, config);
    this.topic = topic;

    console.log('setup fake client');
  }

  fakeIncomingMessages(messages: any[] = []): void {
    messages.forEach(message => {
      super.emit("message", message);
    });
  }

  start(readyCallback = null): void {
    console.log('starting...fake');
    if (!this.topic) {
      return;
    }

    process.nextTick(() => {
      if (readyCallback) {
        readyCallback();
      }
    });
  }

  setupProducer(produceTopic, partitions = 1, readyCallback = null, kafkaErrorCallback = null) {

    process.nextTick(() => {
      if (readyCallback) {
        readyCallback();
      }
    });
  }

  send(topic: string, message: any): Promise<any> {
    return new Promise(resolve => this._send([message], resolve));
  }

  //produce
  _send(payloads: any[], cb: () => void): void {
    payloads.forEach(payload => this.producedMessages.push(payload));
    if (cb) {
      cb();
    }
  }

  close(): void {
    this.producedMessages = [];
  }
}
