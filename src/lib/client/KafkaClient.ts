import { EventEmitter } from "events";
import { KafkaStreamsConfig } from "../../interfaces";

export type KafkaClientStats = {
  inTopic;
  consumer;
  outTopic;
  producer;
}

export type KafkaReadyCallback = () => void | null;
export type KafkaErrorCallback = (e: Error) => void | null;

export abstract class KafkaClient extends EventEmitter {

  abstract topic: string[] | string;

  static _getRandomIntInclusive(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  abstract setProduceHandler(handler: EventEmitter): void;
  abstract getProduceHandler(): null | EventEmitter;
  abstract overwriteTopics(topics: string[]): void;
  abstract start(
    readyCallback: KafkaReadyCallback | null,
    kafkaErrorCallback: KafkaErrorCallback | null,
    withProducer: boolean,
    withBackPressure: boolean
  ): void;
  abstract setupProducer(
    produceTopic: string,
    partitions: number,
    readyCallback: KafkaReadyCallback,
    kafkaErrorCallback: KafkaErrorCallback,
    outputKafkaConfig: KafkaStreamsConfig
  ): void;
  abstract bufferFormat(
    topic: string,
    identifier: string,
    payload: Record<string, unknown>,
    version: number,
    compressionType: number
  ): Promise<void>;
  abstract pause(): void;
  abstract resume(): void;
  abstract getStats(): KafkaClientStats;
  abstract close(): void;
  abstract closeConsumer(): void;
}
