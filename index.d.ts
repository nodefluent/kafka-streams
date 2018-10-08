// declare type Buffer = any;

declare module "kafka-streams" {

    export interface BatchConfig {
        batchSize: number;
        commitEveryNBatch: number;
        concurrency: number;
        commitSync: boolean;
        noBatchCommits: boolean;
    }

    export interface IKafkaStreamsConfig {
      kafkaHost?: string;
      groupId?: string;
      clientName?: string;
      workerPerPartition?: number;
      options?: {
        sessionTimeout?: number;
        protocol?: [string];
        fromOffset?: string;
        fetchMaxBytes?: number;
        fetchMinBytes?: number;
        fetchMaxWaitMs?: number;
        heartbeatInterval?: number;
        retryMinTimeout?: number;
        autoCommit?: boolean;
        autoCommitIntervalMs?: number;
        requireAcks?: number;
        ackTimeoutMs?: number;
        partitionerType?: number;
     };
     noptions?: any;
     health?: any;
     batchOptions?: BatchConfig;
    }

    export class KafkaClient {}
    export class JSKafkaClient extends KafkaClient {}
    export class NativeKafkaClient extends KafkaClient {}

    export interface IStorage {
        set(key: any, value: any): Promise<any>;
        get(key: any): Promise<any>;
        increment(key: any, by?: number): Promise<number>;
        getState(): Promise<object>;
        setState(newState: object): Promise<boolean>;
        close(): Promise<boolean>;
    }

    export class KStorage implements IStorage {
        constructor(options: object);
        set(key: any, value: any): Promise<any>;
        get(key: any): Promise<any>;
        increment(key: any, by?: number): Promise<number>;
        getState(): Promise<object>;
        setState(newState: object): Promise<boolean>;
        close(): Promise<boolean>;
    }

    export class Window {
        constructor(container: [], collect: boolean);
        getStream(): KStream;
        execute(element: any, leaveEncapsulated: boolean): void;
        writeToStream(): void;
    }

    export class StreamDSL {
        constructor(topicName: string, storage?: KStorage, kafka?: KafkaClient, isClone?: boolean);
        getStats(): any;
        getStorage(): KStorage;
        writeToStream(message: any | Array<any>): void;
        getMost(): any;
        getNewMostFrom(array: Array<any>): any;
        replaceInternalObservable(newStream$: any): void;
        setProduceHandler(handler: any): void;
        createAndSetProduceHandler(): any;
        setKafkaStreamsReference(reference: KafkaStreams): void;
        from(topic: string | Array<string>): StreamDSL;
        awaitPromises(etl: (value: Promise<any>) => any): StreamDSL;
        map(etl: (value: any) => any): StreamDSL;
        asyncMap(etl: (value: any) => Promise<any>): StreamDSL;
        concatMap(etl: (valueForStream: any) => any): StreamDSL;
        forEach(etl: (value: any) => void): Promise<void>;
        chainForEach(etl: Function, callback: Function): StreamDSL;
        tap(etl: (value: any) => void): StreamDSL;
        filter(pred: (value: any) => boolean): StreamDSL;
        skipRepeats(): StreamDSL;
        skipRepeatsWith(equals: Function): StreamDSL;
        skip(count: number): StreamDSL;
        take(count: number): StreamDSL;
        multicast(): StreamDSL;
        mapStringToArray(delimiter: string): StreamDSL;
        mapArrayToKV(keyIndex: number, valueIndex: number): StreamDSL;
        mapStringToKV(delimiter: string, keyIndex: number, valueIndex: number): StreamDSL;
        mapJSONParse(): StreamDSL;
        mapStringify(): StreamDSL;
        mapBufferKeyToString(): StreamDSL;
        mapBufferValueToString(): StreamDSL;
        mapStringValueToJSONObject(): StreamDSL;
        mapJSONConvenience(): StreamDSL;
        wrapAsKafkaValue(topic?: string): StreamDSL;
        mapWrapKafkaValue(): StreamDSL;
        atThroughput(count: number, callback: (message: any) => void): StreamDSL;
        mapToFormat(type: string, getId?: (message: any) => any): StreamDSL;
        mapFromFormat(): StreamDSL;
        timestamp(etl: (message: any) => any): StreamDSL;
        constant(substitute: any): StreamDSL;
        scan(eff: (val: any, ret: any) => any, initial: any): StreamDSL;
        slice(start: number, end: number): StreamDSL;
        takeWhile(pred: (message: any) => boolean): StreamDSL;
        skipWhile(pred: (message: any) => boolean): StreamDSL;
        until(signal$: any): StreamDSL;
        since(signal$: any): StreamDSL;
        reduce(eff: (val: any, ret: any) => any, initial: any): Promise<any>;
        chainReduce(eff: (val: any, ret: any) => any, initial: any, callback: (error: Error, value: any) => void): StreamDSL;
        drain(): Promise<void>;
        throttle(throttlePeriod: number): StreamDSL;
        delay(delayTime: number): StreamDSL;
        debounce(debounceTime: number): StreamDSL;
        countByKey(key: string, countFieldName?: string): StreamDSL;
        sumByKey(key: string, fieldName: string, sumField: boolean): StreamDSL;
        min(fieldName: string, minField?: string): StreamDSL;
        max(fieldName: string, maxField?: string): StreamDSL;
        to(topic?: string, outputPartitionsCount?: number | 'auto', produceType?: "send" | "buffer" | "bufferFormat",
            version?: number, compressionType?: number, producerErrorCallback?: (error: Error) => void,
            outputKafkaConfig?: IKafkaStreamsConfig): Promise<boolean>;
    }

    export class KStream extends StreamDSL {
        constructor(topicName: string, storage?: KStorage, kafka?: KafkaClient, isClone?: boolean);
        start(kafkaReadyCallback?: () => void, kafkaErrorCallback?: (error: Error) => void,
            withBackPressure?: boolean, outputKafkaConfig?: IKafkaStreamsConfig): Promise<void>;
        start({ outputKafkaConfig: IKafkaStreamsConfig }): Promise<void>;
        innerJoin(stream: KStream, key?: string, windowed?: boolean, combine?: Function): KStream;
        merge(stream: KStream): KStream;
        fromMost(stream$: any): KStream;
        clone(): KStream;
        window(from: number, to: number, etl?: null | ((message: any) => any), encapsulated?: boolean): {window: Window, abort: () => void, stream: KStream};
        branch(preds: (message: any) => boolean[]): KStream[];
        close(): Promise<boolean>;
    }

    export class KTable extends StreamDSL {
        constructor(topicName: string, keyMapETL: (message: any) => {key: any, value: any}, storage?: KStorage, kafka?: KafkaClient, isClone?: boolean);
        start(kafkaReadyCallback?: () => void, kafkaErrorCallback?: (error: Error) => void,
            withBackPressure?: boolean, outputKafkaConfig?: IKafkaStreamsConfig): Promise<void>;
        writeToTableStream(message: any): void;
        finalise(buildReadyCallback: () => void): void;
        consumeUntilMs(ms: number, finishedCallback: () => void): void;
        consumeUntilCount(count: number, finishedCallback: () => void): void;
        getTable(): object;
        replay(): void;
        merge(stream: StreamDSL): Promise<KTable>;
        clone(): KTable;
        close(): Promise<boolean>;
    }

    export class KafkaStreams {

        constructor(config: IKafkaStreamsConfig, storageClass?: new() => KStorage, storageOptions?: object,
            disableStorageTest?: boolean);

        static checkStorageClass(storageClass: new() => KStorage): void;
        getKafkaClient(topic: string): KafkaClient;
        getStorage(): KStorage;
        getKStream(topic?: string, storage?: new() => KStorage): KStream;
        fromMost($stream: any, storage?: new() => KStorage): KStream;
        getKTable(topic: string, keyMapETL: Function, storage: new() => KStorage): KTable;
        getStats(): Array<object>;
        closeAll(): Promise<Array<boolean>>;
    }
}
