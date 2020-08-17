// declare type Buffer = any;

declare module "kafka-streams" {

    export interface KafkaHealthConfig {
        thresholds?: {
            consumer?: {
                errors?: number;
                lag?: number;
                stallLag?: number;
                minMessages?: number;
            };
            producer?: {
                errors?: number;
                minMessages?: number;
            };
        };
    }

    export interface CommonKafkaOptions {
        "builtin.features"?: string;
        "client.id"?: string;
        "metadata.broker.list": string;
        "message.max.bytes"?: number;
        "message.copy.max.bytes"?: number;
        "receive.message.max.bytes"?: number;
        "max.in.flight.requests.per.connection"?: number;
        "metadata.request.timeout.ms"?: number;
        "topic.metadata.refresh.interval.ms"?: number;
        "metadata.max.age.ms"?: number;
        "topic.metadata.refresh.fast.interval.ms"?: number;
        "topic.metadata.refresh.fast.cnt"?: number;
        "topic.metadata.refresh.sparse"?: boolean;
        "topic.blacklist"?: string;
        "debug"?: string;
        "socket.timeout.ms"?: number;
        "socket.blocking.max.ms"?: number;
        "socket.send.buffer.bytes"?: number;
        "socket.receive.buffer.bytes"?: number;
        "socket.keepalive.enable"?: boolean;
        "socket.nagle.disable"?: boolean;
        "socket.max.fails"?: number;
        "broker.address.ttl"?: number;
        "broker.address.family"?: "any" | "v4" | "v6";
        "reconnect.backoff.jitter.ms"?: number;
        "statistics.interval.ms"?: number;
        "enabled_events"?: number;
        "log_level"?: number;
        "log.queue"?: boolean;
        "log.thread.name"?: boolean;
        "log.connection.close"?: boolean;
        "internal.termination.signal"?: number;
        "api.version.request"?: boolean;
        "api.version.fallback.ms"?: number;
        "broker.version.fallback"?: string;
        "security.protocol"?: "plaintext" | "ssl" | "sasl_plaintext" | "sasl_ssl";
        "ssl.cipher.suites"?: string;
        "ssl.key.location"?: string;
        "ssl.key.password"?: string;
        "ssl.certificate.location"?: string;
        "ssl.ca.location"?: string;
        "ssl.crl.location"?: string;
        "sasl.mechanisms"?: string;
        "sasl.kerberos.service.name"?: string;
        "sasl.kerberos.principal"?: string;
        "sasl.kerberos.kinit.cmd"?: string;
        "sasl.kerberos.keytab"?: string;
        "sasl.kerberos.min.time.before.relogin"?: number;
        "sasl.username"?: string;
        "sasl.password"?: string;
        "partition.assignment.strategy"?: string;
        "session.timeout.ms"?: number;
        "heartbeat.interval.ms"?: number;
        "group.protocol.type"?: string;
        "coordinator.query.interval.ms"?: number;
        "event_cb"?: boolean;
        "group.id": string;
        "enable.auto.commit"?: boolean;
        "auto.commit.interval.ms"?: number;
        "enable.auto.offset.store"?: boolean;
        "queued.min.messages"?: number;
        "queued.max.messages.kbytes"?: number;
        "fetch.wait.max.ms"?: number;
        "fetch.message.max.bytes"?: number;
        "fetch.min.bytes"?: number;
        "fetch.error.backoff.ms"?: number;
        "offset.store.method"?: "none" | "file" | "broker";
        "enable.partition.eof"?: boolean;
        "check.crcs"?: boolean;
        "queue.buffering.max.messages"?: number;
        "queue.buffering.max.kbytes"?: number;
        "queue.buffering.max.ms"?: number;
        "message.send.max.retries"?: number;
        "retry.backoff.ms"?: number;
        "compression.codec"?: "none" | "gzip" | "snappy" | "lz4";
        "batch.num.messages"?: number;
        "delivery.report.only.error"?: boolean;
    }

    export interface CombinedKafkaConfig {
        kafkaHost?: string;
        clientName?: string;
        groupId?: string;
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
            requireAcks?: number;
            ackTimeoutMs?: number;
            partitionerType?: number;
        };
        health?: KafkaHealthConfig;
        tconf?: {
            "auto.commit.enable"?: boolean;
            "auto.commit.interval.ms"?: number;
            "auto.offset.reset"?: "smallest" | "earliest" | "beginning" | "largest" | "latest" | "end" | "error";
            "offset.store.path"?: string;
            "offset.store.sync.interval.ms"?: number;
            "offset.store.method"?: "file" | "broker";
            "consume.callback.max.messages"?: number;
            "request.required.acks"?: number;
            "request.timeout.ms"?: number;
            "message.timeout.ms"?: number;
            "produce.offset.report"?: boolean;
        };
        noptions?: CommonKafkaOptions;
    }

    export interface KafkaStreamsConfig extends CombinedKafkaConfig {
        batchOptions?: {
            batchSize: number;
            commitEveryNBatch: number;
            concurrency: number;
            commitSync: boolean;
            noBatchCommits: boolean;
        };
    }

    export class KafkaClient { }
    export class JSKafkaClient extends KafkaClient { }
    export class NativeKafkaClient extends KafkaClient { }

    export interface Storage {
        set(key: any, value: any): Promise<any>;
        get(key: any): Promise<any>;
        increment(key: any, by?: number): Promise<number>;
        getState(): Promise<object>;
        setState(newState: object): Promise<boolean>;
        close(): Promise<boolean>;
    }

    export class KStorage implements Storage {
        constructor(options: object);
        set(key: any, value: any): Promise<any>;
        get(key: any): Promise<any>;
        increment(key: any, by?: number): Promise<number>;
        getState(): Promise<object>;
        setState(newState: object): Promise<boolean>;
        close(): Promise<boolean>;
    }

    export class Window {
        constructor(container: any[], collect: boolean);
        getStream(): KStream;
        execute(element: any, leaveEncapsulated: boolean): void;
        writeToStream(): void;
    }

    export class StreamDSL {
        constructor(topicName: string, storage?: KStorage, kafka?: KafkaClient, isClone?: boolean);
        getStats(): any;
        getStorage(): KStorage;
        writeToStream(message: any | Array<any>): void;
        getMost(): any;
        getNewMostFrom(array: Array<any>): any;
        replaceInternalObservable(newStream$: any): void;
        setProduceHandler(handler: any): void;
        createAndSetProduceHandler(): any;
        setKafkaStreamsReference(reference: KafkaStreams): void;
        from(topic: string | Array<string>): StreamDSL;
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
        continueWith(f: () => any): StreamDSL;
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
        to(topic?: string, outputPartitionsCount?: number | "auto", produceType?: "send" | "buffer" | "bufferFormat",
            version?: number, compressionType?: number, producerErrorCallback?: (error: Error) => void,
            outputKafkaConfig?: KafkaStreamsConfig): Promise<boolean>;
    }

    export class KStream extends StreamDSL {
        constructor(topicName: string, storage?: KStorage, kafka?: KafkaClient, isClone?: boolean);
        start(kafkaReadyCallback?: () => void, kafkaErrorCallback?: (error: Error) => void,
            withBackPressure?: boolean, outputKafkaConfig?: KafkaStreamsConfig): Promise<void>;
        start(config: { outputKafkaConfig?: KafkaStreamsConfig }): Promise<void>;
        innerJoin(stream: KStream, key?: string, windowed?: boolean, combine?: Function): KStream;
        merge(stream: KStream): KStream;
        fromMost(stream$: any): KStream;
        clone(): KStream;
        window(from: number, to: number, etl?: null | ((message: any) => any), encapsulated?: boolean): { window: Window, abort: () => void, stream: KStream };
        branch(preds: ((message: any) => boolean)[]): KStream[];
        close(): Promise<boolean>;
    }

    export class KTable extends StreamDSL {
        constructor(topicName: string, keyMapETL: (message: any) => { key: any, value: any }, storage?: KStorage, kafka?: KafkaClient, isClone?: boolean);
        start(kafkaReadyCallback?: () => void, kafkaErrorCallback?: (error: Error) => void,
            withBackPressure?: boolean, outputKafkaConfig?: KafkaStreamsConfig): Promise<void>;
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

        constructor(config: KafkaStreamsConfig, storageClass?: new () => KStorage, storageOptions?: object,
            disableStorageTest?: boolean);

        static checkStorageClass(storageClass: new () => KStorage): void;
        getKafkaClient(topic: string): KafkaClient;
        getStorage(): KStorage;
        getKStream(topic?: string, storage?: new () => KStorage): KStream;
        fromMost($stream: any, storage?: new () => KStorage): KStream;
        getKTable(topic: string, keyMapETL: Function, storage: new () => KStorage): KTable;
        getStats(): Array<object>;
        closeAll(): Promise<Array<boolean>>;
    }
}
