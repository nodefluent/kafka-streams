import FakeKafka from "./FakeKafka";

export default class KafkaFactoryStub {
  public lastConsumer: FakeKafka = null;
  public lastProducer: FakeKafka = null;
  public instance;

  constructor() {

    //SINGLETON
    if (this.instance) {
      return this.instance;
    }

    console.log('factory sub...');

    this.instance = this;
    return this;

  }

  getKafkaClient(topic) {
    console.log("KafkaFactoryStub creating KafkaClient for " + topic);
    const kafka = new FakeKafka(topic);
    this.lastConsumer = kafka;
    this.lastProducer = kafka;
    console.log('fks:', kafka, this);
    return kafka;
  }
}
