 Classes

<dl>
<dt><a href="#KeyCount">KeyCount</a></dt>
<dd><p>used to count keys in a stream</p>
</dd>
<dt><a href="#LastState">LastState</a></dt>
<dd><p>used to hold the last state of key values
in a stream e.g. building KTables</p>
</dd>
<dt><a href="#Max">Max</a></dt>
<dd><p>used to grab the highest value of key values
in a stream</p>
</dd>
<dt><a href="#Min">Min</a></dt>
<dd><p>used grab the lowest value of
key values in a stream</p>
</dd>
<dt><a href="#Sum">Sum</a></dt>
<dd><p>used to sum up key values in a stream</p>
</dd>
<dt><a href="#Window">Window</a></dt>
<dd><p>used to build windows of key value states
in a stream</p>
</dd>
<dt><a href="#JSKafkaClient">JSKafkaClient</a></dt>
<dd></dd>
<dt><a href="#NativeKafkaClient">NativeKafkaClient</a></dt>
<dd></dd>
<dt><a href="#KStream">KStream</a></dt>
<dd><p>change-log representation of a stream</p>
</dd>
<dt><a href="#KTable">KTable</a></dt>
<dd><p>table representation of a stream</p>
</dd>
<dt><a href="#StreamDSL">StreamDSL</a></dt>
<dd><p>Stream base class</p>
</dd>
</dl>

<a name="KeyCount"></a>

 KeyCount
used to count keys in a stream

**Kind**: global class  
<a name="LastState"></a>

 LastState
used to hold the last state of key values
in a stream e.g. building KTables

**Kind**: global class  
<a name="Max"></a>

 Max
used to grab the highest value of key values
in a stream

**Kind**: global class  
<a name="Min"></a>

 Min
used grab the lowest value of
key values in a stream

**Kind**: global class  
<a name="Sum"></a>

 Sum
used to sum up key values in a stream

**Kind**: global class  
<a name="Window"></a>

 Window
used to build windows of key value states
in a stream

**Kind**: global class  
<a name="JSKafkaClient"></a>

 JSKafkaClient
**Kind**: global class  

* [JSKafkaClient](#JSKafkaClient)
    * [new JSKafkaClient(topic, config)](#new_JSKafkaClient_new)
    * [.setProduceHandler(handler)](#JSKafkaClient+setProduceHandler)
    * [.getProduceHandler()](#JSKafkaClient+getProduceHandler) ⇒ <code>null</code> \| <code>EventEmitter</code>
    * [.overwriteTopics(topics)](#JSKafkaClient+overwriteTopics)
    * [.start(readyCallback, kafkaErrorCallback, withProducer, withBackPressure)](#JSKafkaClient+start)
    * [.setupProducer(produceTopic, partitions, readyCallback, kafkaErrorCallback)](#JSKafkaClient+setupProducer)
    * [.send(topic, message)](#JSKafkaClient+send) ⇒ <code>\*</code>
    * [.buffer(topic, identifier, payload, compressionType)](#JSKafkaClient+buffer) ⇒ <code>\*</code>
    * [.bufferFormat(topic, identifier, payload, version, compressionType)](#JSKafkaClient+bufferFormat) ⇒ <code>\*</code>

<a name="new_JSKafkaClient_new"></a>

# new JSKafkaClient(topic, config)
KafkaClient (EventEmitter)
that wraps an internal instance of a
Sinek kafka- Consumer and/or Producer


| Param |
| --- |
| topic | 
| config | 

<a name="JSKafkaClient+setProduceHandler"></a>

# jsKafkaClient.setProduceHandler(handler)
sets a handler for produce messages
(emits whenever kafka messages are produced/delivered)

**Kind**: instance method of [<code>JSKafkaClient</code>](#JSKafkaClient)  

| Param | Type |
| --- | --- |
| handler | <code>EventEmitter</code> | 

<a name="JSKafkaClient+getProduceHandler"></a>

# jsKafkaClient.getProduceHandler() ⇒ <code>null</code> \| <code>EventEmitter</code>
returns the produce handler instance if present

**Kind**: instance method of [<code>JSKafkaClient</code>](#JSKafkaClient)  
<a name="JSKafkaClient+overwriteTopics"></a>

# jsKafkaClient.overwriteTopics(topics)
overwrites the topic

**Kind**: instance method of [<code>JSKafkaClient</code>](#JSKafkaClient)  

| Param | Type |
| --- | --- |
| topics | <code>Array.&lt;string&gt;</code> | 

<a name="JSKafkaClient+start"></a>

# jsKafkaClient.start(readyCallback, kafkaErrorCallback, withProducer, withBackPressure)
starts a new kafka consumer (using sinek's partition drainer)
will await a kafka-producer-ready-event if started withProducer=true

**Kind**: instance method of [<code>JSKafkaClient</code>](#JSKafkaClient)  

| Param | Default |
| --- | --- |
| readyCallback | <code></code> | 
| kafkaErrorCallback | <code></code> | 
| withProducer | <code>false</code> | 
| withBackPressure | <code>false</code> | 

<a name="JSKafkaClient+setupProducer"></a>

# jsKafkaClient.setupProducer(produceTopic, partitions, readyCallback, kafkaErrorCallback)
starts a new kafka-producer using sinek's publisher
will fire kafka-producer-ready-event
requires a topic's partition count during initialisation

**Kind**: instance method of [<code>JSKafkaClient</code>](#JSKafkaClient)  

| Param | Default |
| --- | --- |
| produceTopic |  | 
| partitions | <code>1</code> | 
| readyCallback | <code></code> | 
| kafkaErrorCallback | <code></code> | 

<a name="JSKafkaClient+send"></a>

# jsKafkaClient.send(topic, message) ⇒ <code>\*</code>
simply produces a message or multiple on a topic
if producerPartitionCount is > 1 it will randomize
the target partition for the message/s

**Kind**: instance method of [<code>JSKafkaClient</code>](#JSKafkaClient)  

| Param |
| --- |
| topic | 
| message | 

<a name="JSKafkaClient+buffer"></a>

# jsKafkaClient.buffer(topic, identifier, payload, compressionType) ⇒ <code>\*</code>
buffers a keyed message to be send
a keyed message needs an identifier, if none is provided
an uuid.v4() will be generated

**Kind**: instance method of [<code>JSKafkaClient</code>](#JSKafkaClient)  

| Param | Default |
| --- | --- |
| topic |  | 
| identifier |  | 
| payload |  | 
| compressionType | <code>0</code> | 

<a name="JSKafkaClient+bufferFormat"></a>

# jsKafkaClient.bufferFormat(topic, identifier, payload, version, compressionType) ⇒ <code>\*</code>
buffers a keyed message in (a base json format) to be send
a keyed message needs an identifier, if none is provided
an uuid.4() will be generated

**Kind**: instance method of [<code>JSKafkaClient</code>](#JSKafkaClient)  

| Param | Default |
| --- | --- |
| topic |  | 
| identifier |  | 
| payload |  | 
| version | <code>1</code> | 
| compressionType | <code>0</code> | 

<a name="NativeKafkaClient"></a>

 NativeKafkaClient
**Kind**: global class  

* [NativeKafkaClient](#NativeKafkaClient)
    * [new NativeKafkaClient(topic, config, batchOptions)](#new_NativeKafkaClient_new)
    * [.setProduceHandler(handler)](#NativeKafkaClient+setProduceHandler)
    * [.getProduceHandler()](#NativeKafkaClient+getProduceHandler) ⇒ <code>null</code> \| <code>EventEmitter</code>
    * [.overwriteTopics(topics)](#NativeKafkaClient+overwriteTopics)
    * [.start(readyCallback, kafkaErrorCallback, withProducer, withBackPressure)](#NativeKafkaClient+start)
    * [.setupProducer(produceTopic, partitions, readyCallback, kafkaErrorCallback)](#NativeKafkaClient+setupProducer)
    * [.send(topicName, message, partition, key, partitionKey, opaqueKey)](#NativeKafkaClient+send) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.buffer(topic, identifier, payload, _, partition, version, partitionKey)](#NativeKafkaClient+buffer) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.bufferFormat(topic, identifier, payload, version, _, partitionKey, partition)](#NativeKafkaClient+bufferFormat) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="new_NativeKafkaClient_new"></a>

# new NativeKafkaClient(topic, config, batchOptions)
NativeKafkaClient (EventEmitter)
that wraps an internal instance of a
Sinek native kafka- Consumer and/or Producer


| Param | Description |
| --- | --- |
| topic |  |
| config |  |
| batchOptions | optional |

<a name="NativeKafkaClient+setProduceHandler"></a>

# nativeKafkaClient.setProduceHandler(handler)
sets a handler for produce messages
(emits whenever kafka messages are produced/delivered)

**Kind**: instance method of [<code>NativeKafkaClient</code>](#NativeKafkaClient)  

| Param | Type |
| --- | --- |
| handler | <code>EventEmitter</code> | 

<a name="NativeKafkaClient+getProduceHandler"></a>

# nativeKafkaClient.getProduceHandler() ⇒ <code>null</code> \| <code>EventEmitter</code>
returns the produce handler instance if present

**Kind**: instance method of [<code>NativeKafkaClient</code>](#NativeKafkaClient)  
<a name="NativeKafkaClient+overwriteTopics"></a>

# nativeKafkaClient.overwriteTopics(topics)
overwrites the topic

**Kind**: instance method of [<code>NativeKafkaClient</code>](#NativeKafkaClient)  

| Param | Type |
| --- | --- |
| topics | <code>Array.&lt;string&gt;</code> | 

<a name="NativeKafkaClient+start"></a>

# nativeKafkaClient.start(readyCallback, kafkaErrorCallback, withProducer, withBackPressure)
starts a new kafka consumer
will await a kafka-producer-ready-event if started withProducer=true

**Kind**: instance method of [<code>NativeKafkaClient</code>](#NativeKafkaClient)  

| Param | Default |
| --- | --- |
| readyCallback | <code></code> | 
| kafkaErrorCallback | <code></code> | 
| withProducer | <code>false</code> | 
| withBackPressure | <code>false</code> | 

<a name="NativeKafkaClient+setupProducer"></a>

# nativeKafkaClient.setupProducer(produceTopic, partitions, readyCallback, kafkaErrorCallback)
starts a new kafka-producer
will fire kafka-producer-ready-event
requires a topic's partition count during initialisation

**Kind**: instance method of [<code>NativeKafkaClient</code>](#NativeKafkaClient)  

| Param | Default |
| --- | --- |
| produceTopic |  | 
| partitions | <code>1</code> | 
| readyCallback | <code></code> | 
| kafkaErrorCallback | <code></code> | 

<a name="NativeKafkaClient+send"></a>

# nativeKafkaClient.send(topicName, message, partition, key, partitionKey, opaqueKey) ⇒ <code>Promise.&lt;void&gt;</code>
simply produces a message or multiple on a topic
if producerPartitionCount is > 1 it will randomize
the target partition for the message/s

**Kind**: instance method of [<code>NativeKafkaClient</code>](#NativeKafkaClient)  

| Param | Default | Description |
| --- | --- | --- |
| topicName |  |  |
| message |  |  |
| partition | <code></code> | optional |
| key | <code></code> | optional |
| partitionKey | <code></code> | optional |
| opaqueKey | <code></code> | optional |

<a name="NativeKafkaClient+buffer"></a>

# nativeKafkaClient.buffer(topic, identifier, payload, _, partition, version, partitionKey) ⇒ <code>Promise.&lt;void&gt;</code>
buffers a keyed message to be send
a keyed message needs an identifier, if none is provided
an uuid.v4() will be generated

**Kind**: instance method of [<code>NativeKafkaClient</code>](#NativeKafkaClient)  

| Param | Default | Description |
| --- | --- | --- |
| topic |  |  |
| identifier |  |  |
| payload |  |  |
| _ | <code></code> | optional |
| partition | <code></code> | optional |
| version | <code></code> | optional |
| partitionKey | <code></code> | optional |

<a name="NativeKafkaClient+bufferFormat"></a>

# nativeKafkaClient.bufferFormat(topic, identifier, payload, version, _, partitionKey, partition) ⇒ <code>Promise.&lt;void&gt;</code>
buffers a keyed message in (a base json format) to be send
a keyed message needs an identifier, if none is provided
an uuid.4() will be generated

**Kind**: instance method of [<code>NativeKafkaClient</code>](#NativeKafkaClient)  

| Param | Default | Description |
| --- | --- | --- |
| topic |  |  |
| identifier |  |  |
| payload |  |  |
| version | <code>1</code> | optional |
| _ | <code></code> | optional |
| partitionKey | <code></code> | optional |
| partition | <code></code> | optional |

<a name="KStream"></a>

 KStream
change-log representation of a stream

**Kind**: global class  

* [KStream](#KStream)
    * [new KStream(topicName, storage, kafka, isClone)](#new_KStream_new)
    * [.start(kafkaReadyCallback, kafkaErrorCallback, withBackPressure)](#KStream+start)
    * [.innerJoin(stream, key, windowed, combine)](#KStream+innerJoin) ⇒ [<code>KStream</code>](#KStream)
    * [.outerJoin(stream)](#KStream+outerJoin)
    * [.leftJoin(stream)](#KStream+leftJoin)
    * [.merge(stream)](#KStream+merge) ⇒ [<code>KStream</code>](#KStream)
    * [.fromMost()](#KStream+fromMost) ⇒ [<code>KStream</code>](#KStream)
    * [.clone()](#KStream+clone) ⇒ [<code>KStream</code>](#KStream)
    * [.window(from, to, etl, encapsulated)](#KStream+window) ⇒ <code>Object</code>
    * [.close()](#KStream+close) ⇒ <code>Promise.&lt;boolean&gt;</code>

<a name="new_KStream_new"></a>

# new KStream(topicName, storage, kafka, isClone)
creates a changelog representation of a stream
join operations of kstream instances are synchronous
and return new instances immediately


| Param | Type | Default |
| --- | --- | --- |
| topicName | <code>string</code> |  | 
| storage | <code>KStorage</code> | <code></code> | 
| kafka | <code>KafkaClient</code> | <code></code> | 
| isClone | <code>boolean</code> | <code>false</code> | 

<a name="KStream+start"></a>

# kStream.start(kafkaReadyCallback, kafkaErrorCallback, withBackPressure)
start kafka consumption
prepare production of messages if necessary
when called with zero or just a single callback argument
this function will return a promise and use the callback for errors

**Kind**: instance method of [<code>KStream</code>](#KStream)  

| Param | Type | Default |
| --- | --- | --- |
| kafkaReadyCallback | <code>function</code> | <code></code> | 
| kafkaErrorCallback | <code>function</code> | <code></code> | 
| withBackPressure | <code>boolean</code> | <code>false</code> | 

<a name="KStream+innerJoin"></a>

# kStream.innerJoin(stream, key, windowed, combine) ⇒ [<code>KStream</code>](#KStream)
Emits an output when both input sources have records with the same key.
s1$:{object} + s2$:{object} -> j$:{left: s1$object, right: s2$object}

**Kind**: instance method of [<code>KStream</code>](#KStream)  

| Param | Type | Default |
| --- | --- | --- |
| stream | [<code>StreamDSL</code>](#StreamDSL) |  | 
| key | <code>string</code> | <code>&quot;key&quot;</code> | 
| windowed | <code>boolean</code> | <code>false</code> | 
| combine | <code>function</code> | <code></code> | 

<a name="KStream+outerJoin"></a>

# kStream.outerJoin(stream)
Emits an output for each record in either input source.
If only one source contains a key, the other is null

**Kind**: instance method of [<code>KStream</code>](#KStream)  

| Param | Type |
| --- | --- |
| stream | [<code>StreamDSL</code>](#StreamDSL) | 

<a name="KStream+leftJoin"></a>

# kStream.leftJoin(stream)
Emits an output for each record in the left or primary input source.
If the other source does not have a value for a given key, it is set to null

**Kind**: instance method of [<code>KStream</code>](#KStream)  

| Param | Type |
| --- | --- |
| stream | [<code>StreamDSL</code>](#StreamDSL) | 

<a name="KStream+merge"></a>

# kStream.merge(stream) ⇒ [<code>KStream</code>](#KStream)
Emits an output for each record in any of the streams.
Acts as simple merge of both streams.
can be used with KStream or KTable instances
returns a NEW KStream instance

**Kind**: instance method of [<code>KStream</code>](#KStream)  

| Param | Type |
| --- | --- |
| stream | [<code>StreamDSL</code>](#StreamDSL) | 

<a name="KStream+fromMost"></a>

# kStream.fromMost() ⇒ [<code>KStream</code>](#KStream)
creates a new KStream instance from a given most.js
stream; the consume topic will be empty and therefore
no consumer will be build

**Kind**: instance method of [<code>KStream</code>](#KStream)  

| Param | Type | Description |
| --- | --- | --- |
| most.js | <code>Object</code> | stream |

<a name="KStream+clone"></a>

# kStream.clone() ⇒ [<code>KStream</code>](#KStream)
as only joins and window operations return new stream instances
you might need a clone sometimes, which can be accomplished
using this function

**Kind**: instance method of [<code>KStream</code>](#KStream)  
<a name="KStream+window"></a>

# kStream.window(from, to, etl, encapsulated) ⇒ <code>Object</code>
builds a window'ed stream across all events of the current kstream
when the first event with an exceeding "to" is received (or the abort()
callback is called) the window closes and emits its "collected" values to the
returned kstream
from and to must be unix epoch timestamps in milliseconds (Date.now())
etl can be a function that should return the timestamp (event time) of
from within the message e.g. m -> m.payload.createdAt
if etl is not given, a timestamp of receiving will be used (processing time)
for each event
encapsulated refers to the result messages (defaults to true, they will be
encapsulated in an object: {time, value}

**Kind**: instance method of [<code>KStream</code>](#KStream)  

| Param | Type | Default |
| --- | --- | --- |
| from | <code>number</code> |  | 
| to | <code>number</code> |  | 
| etl | <code>function</code> | <code></code> | 
| encapsulated | <code>boolean</code> | <code>true</code> | 

<a name="KStream+close"></a>

# kStream.close() ⇒ <code>Promise.&lt;boolean&gt;</code>
closes the internal stream
and all kafka open connections
as well as KStorage connections

**Kind**: instance method of [<code>KStream</code>](#KStream)  
<a name="KTable"></a>

 KTable
table representation of a stream

**Kind**: global class  

* [KTable](#KTable)
    * [new KTable(topicName, keyMapETL, storage, kafka, isClone)](#new_KTable_new)
    * [.start(kafkaReadyCallback, kafkaErrorCallback, withBackPressure)](#KTable+start)
    * [.innerJoin(stream, key)](#KTable+innerJoin)
    * [.outerJoin(stream)](#KTable+outerJoin)
    * [.leftJoin(stream)](#KTable+leftJoin)
    * [.writeToTableStream(message)](#KTable+writeToTableStream)
    * [.consumeUntilMs(ms, finishedCallback)](#KTable+consumeUntilMs) ⇒ [<code>KTable</code>](#KTable)
    * [.consumeUntilCount(count, finishedCallback)](#KTable+consumeUntilCount) ⇒ [<code>KTable</code>](#KTable)
    * [.consumeUntilLatestOffset(finishedCallback)](#KTable+consumeUntilLatestOffset)
    * [.getTable()](#KTable+getTable) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.replay()](#KTable+replay)
    * [.merge(stream)](#KTable+merge) ⇒ [<code>Promise.&lt;KTable&gt;</code>](#KTable)
    * [.clone()](#KTable+clone) ⇒ [<code>Promise.&lt;KTable&gt;</code>](#KTable)
    * [.close()](#KTable+close) ⇒ <code>Promise.&lt;boolean&gt;</code>

<a name="new_KTable_new"></a>

# new KTable(topicName, keyMapETL, storage, kafka, isClone)
creates a table representation of a stream
join operations of ktable instances are asynchronous
and return promises
keyMapETL = v -> {key, value} (sync)


| Param | Type | Default |
| --- | --- | --- |
| topicName | <code>string</code> |  | 
| keyMapETL | <code>function</code> |  | 
| storage | <code>KStorage</code> | <code></code> | 
| kafka | <code>KafkaClient</code> | <code></code> | 
| isClone | <code>boolean</code> | <code>false</code> | 

<a name="KTable+start"></a>

# kTable.start(kafkaReadyCallback, kafkaErrorCallback, withBackPressure)
start kafka consumption
prepare production of messages if necessary
when called with zero or just a single callback argument
this function will return a promise and use the callback for errors

**Kind**: instance method of [<code>KTable</code>](#KTable)  

| Param | Type | Default |
| --- | --- | --- |
| kafkaReadyCallback | <code>function</code> | <code></code> | 
| kafkaErrorCallback | <code>function</code> | <code></code> | 
| withBackPressure | <code>boolean</code> | <code>false</code> | 

<a name="KTable+innerJoin"></a>

# kTable.innerJoin(stream, key)
Emits an output when both input sources have records with the same key.

**Kind**: instance method of [<code>KTable</code>](#KTable)  

| Param | Type | Default |
| --- | --- | --- |
| stream | [<code>StreamDSL</code>](#StreamDSL) |  | 
| key | <code>string</code> | <code>&quot;key&quot;</code> | 

<a name="KTable+outerJoin"></a>

# kTable.outerJoin(stream)
Emits an output for each record in either input source.
If only one source contains a key, the other is null

**Kind**: instance method of [<code>KTable</code>](#KTable)  

| Param | Type |
| --- | --- |
| stream | [<code>StreamDSL</code>](#StreamDSL) | 

<a name="KTable+leftJoin"></a>

# kTable.leftJoin(stream)
Emits an output for each record in the left or primary input source.
If the other source does not have a value for a given key, it is set to null

**Kind**: instance method of [<code>KTable</code>](#KTable)  

| Param | Type |
| --- | --- |
| stream | [<code>StreamDSL</code>](#StreamDSL) | 

<a name="KTable+writeToTableStream"></a>

# kTable.writeToTableStream(message)
write message to the internal stream

**Kind**: instance method of [<code>KTable</code>](#KTable)  

| Param | Type |
| --- | --- |
| message | <code>any</code> | 

<a name="KTable+consumeUntilMs"></a>

# kTable.consumeUntilMs(ms, finishedCallback) ⇒ [<code>KTable</code>](#KTable)
consume messages until ms passed

**Kind**: instance method of [<code>KTable</code>](#KTable)  

| Param | Type | Default |
| --- | --- | --- |
| ms | <code>number</code> | <code>1000</code> | 
| finishedCallback | <code>function</code> | <code></code> | 

<a name="KTable+consumeUntilCount"></a>

# kTable.consumeUntilCount(count, finishedCallback) ⇒ [<code>KTable</code>](#KTable)
consume messages until a certain count is reached

**Kind**: instance method of [<code>KTable</code>](#KTable)  

| Param | Type | Default |
| --- | --- | --- |
| count | <code>number</code> | <code>1000</code> | 
| finishedCallback | <code>function</code> | <code></code> | 

<a name="KTable+consumeUntilLatestOffset"></a>

# kTable.consumeUntilLatestOffset(finishedCallback)
consume messages until latest offset of topic

**Kind**: instance method of [<code>KTable</code>](#KTable)  

| Param | Type | Default |
| --- | --- | --- |
| finishedCallback | <code>function</code> | <code></code> | 

<a name="KTable+getTable"></a>

# kTable.getTable() ⇒ <code>Promise.&lt;object&gt;</code>
returns the state of the internal KStorage

**Kind**: instance method of [<code>KTable</code>](#KTable)  
<a name="KTable+replay"></a>

# kTable.replay()
rewrites content of internal KStorage
to the stream, every observer will receive
the content as KV {key, value} object

**Kind**: instance method of [<code>KTable</code>](#KTable)  
<a name="KTable+merge"></a>

# kTable.merge(stream) ⇒ [<code>Promise.&lt;KTable&gt;</code>](#KTable)
Emits an output for each record in any of the streams.
Acts as simple merge of both streams.
can be used with KStream or KTable instances
returns a Promise with a NEW KTable instance

**Kind**: instance method of [<code>KTable</code>](#KTable)  

| Param | Type |
| --- | --- |
| stream | [<code>StreamDSL</code>](#StreamDSL) | 

<a name="KTable+clone"></a>

# kTable.clone() ⇒ [<code>Promise.&lt;KTable&gt;</code>](#KTable)
as only joins and window operations return new stream instances
you might need a clone sometimes, which can be accomplished
using this function

**Kind**: instance method of [<code>KTable</code>](#KTable)  
<a name="KTable+close"></a>

# kTable.close() ⇒ <code>Promise.&lt;boolean&gt;</code>
closes the internal stream
and all kafka open connections
as well as KStorage connections

**Kind**: instance method of [<code>KTable</code>](#KTable)  
<a name="StreamDSL"></a>

 StreamDSL
Stream base class

**Kind**: global class  

* [StreamDSL](#StreamDSL)
    * [new StreamDSL(topicName, storage, kafka, isClone)](#new_StreamDSL_new)
    * [.start()](#StreamDSL+start)
    * [.getStats()](#StreamDSL+getStats) ⇒ <code>object</code>
    * [.getStorage()](#StreamDSL+getStorage) ⇒ <code>KStorage</code>
    * [.writeToStream(message)](#StreamDSL+writeToStream)
    * [.getMost()](#StreamDSL+getMost) ⇒ <code>Object</code>
    * [.replaceInternalObservable(newStream$)](#StreamDSL+replaceInternalObservable)
    * [.setProduceHandler(handler)](#StreamDSL+setProduceHandler)
    * [.createAndSetProduceHandler()](#StreamDSL+createAndSetProduceHandler) ⇒ <code>module:events.internal</code>
    * [.setKafkaStreamsReference(reference)](#StreamDSL+setKafkaStreamsReference)
    * [.from(topicName)](#StreamDSL+from) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.map(etl)](#StreamDSL+map) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.asyncMap(etl)](#StreamDSL+asyncMap) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.forEach(eff)](#StreamDSL+forEach) ⇒ <code>\*</code>
    * [.chainForEach(eff, callback)](#StreamDSL+chainForEach) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.tap(eff)](#StreamDSL+tap)
    * [.filter(pred)](#StreamDSL+filter) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.skipRepeats()](#StreamDSL+skipRepeats) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.skipRepeatsWith(equals)](#StreamDSL+skipRepeatsWith) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.skip(count)](#StreamDSL+skip) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.take(count)](#StreamDSL+take) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.mapStringToArray(delimiter)](#StreamDSL+mapStringToArray) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.mapArrayToKV(keyIndex, valueIndex)](#StreamDSL+mapArrayToKV) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.mapStringToKV(delimiter, keyIndex, valueIndex)](#StreamDSL+mapStringToKV) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.mapJSONParse()](#StreamDSL+mapJSONParse) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.mapStringify()](#StreamDSL+mapStringify) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.mapBufferKeyToString()](#StreamDSL+mapBufferKeyToString) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.mapBufferValueToString()](#StreamDSL+mapBufferValueToString) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.mapStringValueToJSONObject()](#StreamDSL+mapStringValueToJSONObject) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.mapJSONConvenience()](#StreamDSL+mapJSONConvenience) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.wrapAsKafkaValue(topic)](#StreamDSL+wrapAsKafkaValue) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.mapWrapKafkaValue()](#StreamDSL+mapWrapKafkaValue) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.atThroughput(count, callback)](#StreamDSL+atThroughput) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.mapToFormat(type, getId)](#StreamDSL+mapToFormat) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.mapFromFormat()](#StreamDSL+mapFromFormat) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.timestamp(etl)](#StreamDSL+timestamp) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.constant(substitute)](#StreamDSL+constant) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.scan(eff, initial)](#StreamDSL+scan) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.slice(start, end)](#StreamDSL+slice) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.takeWhile(pred)](#StreamDSL+takeWhile) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.skipWhile(pred)](#StreamDSL+skipWhile) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.until(signal$)](#StreamDSL+until) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.since(signal$)](#StreamDSL+since) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.reduce(eff, initial)](#StreamDSL+reduce) ⇒ <code>\*</code>
    * [.chainReduce(eff, initial, callback)](#StreamDSL+chainReduce) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.drain()](#StreamDSL+drain) ⇒ <code>\*</code>
    * [.throttle(throttlePeriod)](#StreamDSL+throttle) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.delay(delayTime)](#StreamDSL+delay) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.debounce(debounceTime)](#StreamDSL+debounce) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.countByKey(key, countFieldName)](#StreamDSL+countByKey) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.sumByKey(key, fieldName, sumField)](#StreamDSL+sumByKey) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.min(fieldName, minField)](#StreamDSL+min) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [.max(fieldName, maxField)](#StreamDSL+max) ⇒ [<code>StreamDSL</code>](#StreamDSL)
    * [._merge(otherStream$)](#StreamDSL+_merge)
    * [._zip(otherStream$, combine)](#StreamDSL+_zip)
    * [.to(topic, outputPartitionsCount, produceType, version, compressionType, producerErrorCallback)](#StreamDSL+to) ⇒ <code>Promise.&lt;boolean&gt;</code>

<a name="new_StreamDSL_new"></a>

# new StreamDSL(topicName, storage, kafka, isClone)
Stream base class that wraps around a private most.js stream$
and interacts with storages/actions and a kafka-client instance.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| topicName | <code>string</code> \| <code>Array.&lt;string&gt;</code> |  | can also be topics |
| storage | <code>KStorage</code> | <code></code> |  |
| kafka | <code>KafkaClient</code> | <code></code> |  |
| isClone | <code>boolean</code> | <code>false</code> |  |

<a name="StreamDSL+start"></a>

# streamDSL.start()
dummy, should be overwritten

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
<a name="StreamDSL+getStats"></a>

# streamDSL.getStats() ⇒ <code>object</code>
returns a stats object with information
about the internal kafka clients

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
<a name="StreamDSL+getStorage"></a>

# streamDSL.getStorage() ⇒ <code>KStorage</code>
returns the internal KStorage instance

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
<a name="StreamDSL+writeToStream"></a>

# streamDSL.writeToStream(message)
can be used to manually write message/events
to the internal stream$

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param | Type |
| --- | --- |
| message | <code>Object</code> \| <code>Array.&lt;Object&gt;</code> | 

<a name="StreamDSL+getMost"></a>

# streamDSL.getMost() ⇒ <code>Object</code>
returns the internal most.js stream

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
**Returns**: <code>Object</code> - most.js stream  
<a name="StreamDSL+replaceInternalObservable"></a>

# streamDSL.replaceInternalObservable(newStream$)
used to clone or during merges
resets the internal event emitter to the new stream
and replaces the internal stream with the merged new stream

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| newStream$ | 

<a name="StreamDSL+setProduceHandler"></a>

# streamDSL.setProduceHandler(handler)
sets a handler for produce messages
(emits whenever kafka messages are produced/delivered)
events: produced, delivered

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param | Type |
| --- | --- |
| handler | <code>module:events.internal</code> | 

<a name="StreamDSL+createAndSetProduceHandler"></a>

# streamDSL.createAndSetProduceHandler() ⇒ <code>module:events.internal</code>
creates (and returns) and sets a produce handler
for this stream instance

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
<a name="StreamDSL+setKafkaStreamsReference"></a>

# streamDSL.setKafkaStreamsReference(reference)
overwrites the internal kafkaStreams reference

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| reference | 

<a name="StreamDSL+from"></a>

# streamDSL.from(topicName) ⇒ [<code>StreamDSL</code>](#StreamDSL)
add more topic/s to the consumer

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param | Type |
| --- | --- |
| topicName | <code>string</code> \| <code>Array.&lt;string&gt;</code> | 

<a name="StreamDSL+map"></a>

# streamDSL.map(etl) ⇒ [<code>StreamDSL</code>](#StreamDSL)
simple synchronous map function
etl = v -> v2

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| etl | 

<a name="StreamDSL+asyncMap"></a>

# streamDSL.asyncMap(etl) ⇒ [<code>StreamDSL</code>](#StreamDSL)
map that expects etl to return a Promise
can be used to apply async maps to stream
etl = v -> Promise

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| etl | 

<a name="StreamDSL+forEach"></a>

# streamDSL.forEach(eff) ⇒ <code>\*</code>
(do not use for side effects,
except for a closing operation at the end of the stream)
may not be used to chain
eff = v -> void

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
**Returns**: <code>\*</code> - Promise  

| Param |
| --- |
| eff | 

<a name="StreamDSL+chainForEach"></a>

# streamDSL.chainForEach(eff, callback) ⇒ [<code>StreamDSL</code>](#StreamDSL)
runs forEach on a multicast stream
you probably would not want to use this in production

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param | Default |
| --- | --- |
| eff |  | 
| callback | <code></code> | 

<a name="StreamDSL+tap"></a>

# streamDSL.tap(eff)
(alternative to forEach if in the middle of a
stream operation chain)
use this for side-effects
errors in eff will break stream

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| eff | 

<a name="StreamDSL+filter"></a>

# streamDSL.filter(pred) ⇒ [<code>StreamDSL</code>](#StreamDSL)
stream contains only events for which predicate
returns true
pred = v -> boolean

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| pred | 

<a name="StreamDSL+skipRepeats"></a>

# streamDSL.skipRepeats() ⇒ [<code>StreamDSL</code>](#StreamDSL)
will remove duplicate messages
be aware that this might take a lot of memory

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
<a name="StreamDSL+skipRepeatsWith"></a>

# streamDSL.skipRepeatsWith(equals) ⇒ [<code>StreamDSL</code>](#StreamDSL)
skips repeats per your definition
equals = (a,b) -> boolean

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| equals | 

<a name="StreamDSL+skip"></a>

# streamDSL.skip(count) ⇒ [<code>StreamDSL</code>](#StreamDSL)
skips the amount of messages

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| count | 

<a name="StreamDSL+take"></a>

# streamDSL.take(count) ⇒ [<code>StreamDSL</code>](#StreamDSL)
takes the first messages until count
and omits the rest

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| count | 

<a name="StreamDSL+mapStringToArray"></a>

# streamDSL.mapStringToArray(delimiter) ⇒ [<code>StreamDSL</code>](#StreamDSL)
easy string to array mapping
you can pass your delimiter
default is space
"bla blup" => ["bla", "blup"]

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param | Default |
| --- | --- |
| delimiter | <code> </code> | 

<a name="StreamDSL+mapArrayToKV"></a>

# streamDSL.mapArrayToKV(keyIndex, valueIndex) ⇒ [<code>StreamDSL</code>](#StreamDSL)
easy array to key-value object mapping
you can pass your own indices
default is 0,1
["bla", "blup"] => { key: "bla", value: "blup" }

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param | Default |
| --- | --- |
| keyIndex | <code>0</code> | 
| valueIndex | <code>1</code> | 

<a name="StreamDSL+mapStringToKV"></a>

# streamDSL.mapStringToKV(delimiter, keyIndex, valueIndex) ⇒ [<code>StreamDSL</code>](#StreamDSL)
easy string to key-value object mapping
you can pass your own delimiter and indices
default is " " and 0,1
"bla blup" => { key: "bla", value: "blup" }

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param | Default |
| --- | --- |
| delimiter | <code> </code> | 
| keyIndex | <code>0</code> | 
| valueIndex | <code>1</code> | 

<a name="StreamDSL+mapJSONParse"></a>

# streamDSL.mapJSONParse() ⇒ [<code>StreamDSL</code>](#StreamDSL)
maps every stream event through JSON.parse
if its type is an object
(if parsing fails, the error object will be returned)

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
<a name="StreamDSL+mapStringify"></a>

# streamDSL.mapStringify() ⇒ [<code>StreamDSL</code>](#StreamDSL)
maps every stream event through JSON.stringify
if its type is object

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
<a name="StreamDSL+mapBufferKeyToString"></a>

# streamDSL.mapBufferKeyToString() ⇒ [<code>StreamDSL</code>](#StreamDSL)
maps an object type event with a Buffer key field
to an object event with a string key field

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
<a name="StreamDSL+mapBufferValueToString"></a>

# streamDSL.mapBufferValueToString() ⇒ [<code>StreamDSL</code>](#StreamDSL)
maps an object type event with a Buffer value field
to an object event with a string value field

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
<a name="StreamDSL+mapStringValueToJSONObject"></a>

# streamDSL.mapStringValueToJSONObject() ⇒ [<code>StreamDSL</code>](#StreamDSL)
maps an object type event with a string value field
to an object event with (parsed) object value field

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
<a name="StreamDSL+mapJSONConvenience"></a>

# streamDSL.mapJSONConvenience() ⇒ [<code>StreamDSL</code>](#StreamDSL)
takes a buffer kafka message
and turns it into a json representation
buffer key -> string
buffer value -> string -> object

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
<a name="StreamDSL+wrapAsKafkaValue"></a>

# streamDSL.wrapAsKafkaValue(topic) ⇒ [<code>StreamDSL</code>](#StreamDSL)
wraps an event value inside a kafka message object
the event value will be used as value of the kafka message

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param | Description |
| --- | --- |
| topic | optional |

<a name="StreamDSL+mapWrapKafkaValue"></a>

# streamDSL.mapWrapKafkaValue() ⇒ [<code>StreamDSL</code>](#StreamDSL)
maps every stream event's kafka message
right to its payload value

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
<a name="StreamDSL+atThroughput"></a>

# streamDSL.atThroughput(count, callback) ⇒ [<code>StreamDSL</code>](#StreamDSL)
taps to the stream
counts messages and returns
callback once (when message count is reached)
with the current message at count

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param | Type | Default |
| --- | --- | --- |
| count | <code>number</code> | <code>1</code> | 
| callback | <code>function</code> |  | 

<a name="StreamDSL+mapToFormat"></a>

# streamDSL.mapToFormat(type, getId) ⇒ [<code>StreamDSL</code>](#StreamDSL)
* default kafka format stringify
{} -> {payload, time, type, id}
getId can be a function to read the id from the message
e.g. getId = message -> message.id

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param | Default |
| --- | --- |
| type | <code>unknown-publish</code> | 
| getId | <code></code> | 

<a name="StreamDSL+mapFromFormat"></a>

# streamDSL.mapFromFormat() ⇒ [<code>StreamDSL</code>](#StreamDSL)
default kafka format parser
{value: "{ payload: {} }" -> {}

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
<a name="StreamDSL+timestamp"></a>

# streamDSL.timestamp(etl) ⇒ [<code>StreamDSL</code>](#StreamDSL)
maps elements into {time, value} objects

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| etl | 

<a name="StreamDSL+constant"></a>

# streamDSL.constant(substitute) ⇒ [<code>StreamDSL</code>](#StreamDSL)
replace every element with the substitute value

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| substitute | 

<a name="StreamDSL+scan"></a>

# streamDSL.scan(eff, initial) ⇒ [<code>StreamDSL</code>](#StreamDSL)
mapping to incrementally accumulated results,
starting with the provided initial value.

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| eff | 
| initial | 

<a name="StreamDSL+slice"></a>

# streamDSL.slice(start, end) ⇒ [<code>StreamDSL</code>](#StreamDSL)
slicing events from start ot end of index

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| start | 
| end | 

<a name="StreamDSL+takeWhile"></a>

# streamDSL.takeWhile(pred) ⇒ [<code>StreamDSL</code>](#StreamDSL)
contain events until predicate
returns false
m -> !!m

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| pred | 

<a name="StreamDSL+skipWhile"></a>

# streamDSL.skipWhile(pred) ⇒ [<code>StreamDSL</code>](#StreamDSL)
contain events after predicate
returns false

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| pred | 

<a name="StreamDSL+until"></a>

# streamDSL.until(signal$) ⇒ [<code>StreamDSL</code>](#StreamDSL)
contain events until signal$ emits first event
signal$ must be a most stream instance

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| signal$ | 

<a name="StreamDSL+since"></a>

# streamDSL.since(signal$) ⇒ [<code>StreamDSL</code>](#StreamDSL)
contain all events after signal$ emits first event
signal$ must be a most stream instance

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| signal$ | 

<a name="StreamDSL+reduce"></a>

# streamDSL.reduce(eff, initial) ⇒ <code>\*</code>
reduce a stream to a single result
will return a promise

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
**Returns**: <code>\*</code> - Promise  

| Param |
| --- |
| eff | 
| initial | 

<a name="StreamDSL+chainReduce"></a>

# streamDSL.chainReduce(eff, initial, callback) ⇒ [<code>StreamDSL</code>](#StreamDSL)
runs reduce on a multicast stream
you probably would not want to use this in production

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| eff | 
| initial | 
| callback | 

<a name="StreamDSL+drain"></a>

# streamDSL.drain() ⇒ <code>\*</code>
drains the stream, equally to forEach
without iterator, returns a promise

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  
**Returns**: <code>\*</code> - Promise  
<a name="StreamDSL+throttle"></a>

# streamDSL.throttle(throttlePeriod) ⇒ [<code>StreamDSL</code>](#StreamDSL)
limits rate events at most one per throttlePeriod
throttlePeriod = index count omit

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| throttlePeriod | 

<a name="StreamDSL+delay"></a>

# streamDSL.delay(delayTime) ⇒ [<code>StreamDSL</code>](#StreamDSL)
delays every event in stream by given time

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| delayTime | 

<a name="StreamDSL+debounce"></a>

# streamDSL.debounce(debounceTime) ⇒ [<code>StreamDSL</code>](#StreamDSL)
wait for a burst of events and emit
only the last event

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| debounceTime | 

<a name="StreamDSL+countByKey"></a>

# streamDSL.countByKey(key, countFieldName) ⇒ [<code>StreamDSL</code>](#StreamDSL)
maps into counts per key
requires events to have a present key/value field

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param | Default |
| --- | --- |
| key | <code>key</code> | 
| countFieldName | <code>count</code> | 

<a name="StreamDSL+sumByKey"></a>

# streamDSL.sumByKey(key, fieldName, sumField) ⇒ [<code>StreamDSL</code>](#StreamDSL)
maps into sums per key
requires events to have a present key/value field

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param | Default |
| --- | --- |
| key | <code>key</code> | 
| fieldName | <code>value</code> | 
| sumField | <code>false</code> | 

<a name="StreamDSL+min"></a>

# streamDSL.min(fieldName, minField) ⇒ [<code>StreamDSL</code>](#StreamDSL)
collects the smallest value
of the given field, will not alter
the events in the stream
use .getStorage().getMin() to get the
latest value which is stored

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param | Default |
| --- | --- |
| fieldName | <code>value</code> | 
| minField | <code>min</code> | 

<a name="StreamDSL+max"></a>

# streamDSL.max(fieldName, maxField) ⇒ [<code>StreamDSL</code>](#StreamDSL)
collects the greatest value
of the given field, will not alter
the events in the stream
use .getStorage().getMax() to get the
latest value which is stored

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param | Default |
| --- | --- |
| fieldName | <code>value</code> | 
| maxField | <code>max</code> | 

<a name="StreamDSL+_merge"></a>

# streamDSL._merge(otherStream$)
merge this stream with another, resulting a
stream with all elements from both streams

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| otherStream$ | 

<a name="StreamDSL+_zip"></a>

# streamDSL._zip(otherStream$, combine)
merge this stream with another stream
by combining (zipping) every event from each stream
to a single new event on the new stream
combine = (e1, e2) -> e1 + e2

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param |
| --- |
| otherStream$ | 
| combine | 

<a name="StreamDSL+to"></a>

# streamDSL.to(topic, outputPartitionsCount, produceType, version, compressionType, producerErrorCallback) ⇒ <code>Promise.&lt;boolean&gt;</code>
define an output topic
when passed to KafkaStreams this will trigger
the stream$ result to be produced to the given topic name
if the instance is a clone, this function call will have to setup a kafka producer
returns a promise

**Kind**: instance method of [<code>StreamDSL</code>](#StreamDSL)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| topic | <code>string</code> |  | optional |
| outputPartitionsCount | <code>number</code> | <code>1</code> | optional |
| produceType | <code>string</code> | <code>&quot;send&quot;</code> | optional |
| version | <code>number</code> | <code>1</code> | optional |
| compressionType | <code>number</code> | <code>0</code> | optional |
| producerErrorCallback | <code>function</code> | <code></code> | optional |

