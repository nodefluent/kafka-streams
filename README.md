# kafka-streams
[kafka-streams](http://docs.confluent.io/3.0.0/streams) :octopus: equivalent for nodejs :turtle: :rocket:

build on super fast :fire: observables using [most.js](https://github.com/cujojs/most) :metal:

ships with [sinek](https://github.com/krystianity/node-sinek) :pray: for backpressure

overwriteable local-storage solution allows for any kind of ETL datastore e.g. RocksDB, Redis, Postgres..

async (Promises) and sync stream operators e.g. `stream$.map()` or `stream$.asyncMap()`

super easy API :trollface:

## Aim of this Library
- this is not a 1:1 port of the official Java kafka-streams
- the goal of this project is to give at least the same options to
a nodejs developer that kafka-streams currently gives a JVM dev
- stream-state processing, table representation, joins, aggregate etc.
I am aiming for the easiest api access possible checkout the [word count example](https://github.com/krystianity/kafka-streams/blob/master/examples/wordCount.js)

## Progress Overview (Port Adaption)

- [x] core structure
- [x] KStream - stream as a changelog
- [x] KTable - stream as a database
- [ ] complex stream join structure
- [ ] windows (joins)
- [x] word-count example
- [x] local-storage for etl actions
- [ ] local-storage factory (one per action)
- [ ] storing and reading local-storage via kafka topic
- [ ] kafka client implementation
- [x] KTable replay to Kafka (produce)
- [ ] sinek implementation for backpressure
- [ ] auto-json payloads (read-map/write-map)
- [ ] documentation
- [ ] API description
- [ ] ..

## Operator Implementations

- [x] map + asyncMap
- [ ] constant
- [ ] scan*
- [ ] ap
- [ ] timestamp*
- [ ] tap
- [x] filter
- [x] skipRepeats
- [x] skipRepeatsWith
- [ ] transduce
- [ ] slice
- [x] take*
- [x] skip
- [ ] takeWhile
- [ ] skipWhile
- [ ] until
- [ ] since
- [ ] during
- [ ] thru
- [ ] reduce*
- [x] forEach
- [ ] drain
- [ ] merge*
- [ ] combine
- [ ] sample
- [ ] sampleWith
- [ ] zip*
- [ ] switch
- [ ] join*
- [ ] throttle
- [ ] debounce
- [ ] delay
- [ ] multicast
- \* will be implemented next
- Want more? Feel free to open an issue :cop:
 
## Stream Action Implementations

- [x] countByKey
- [x] sumByKey
- [ ] ..
- Want more? Feel free to open an issue :cop:

## Can I use this library yet?
No, but very soon (aiming for end of April 2017).

## Are we ready for production yet?
No, please have some more patience :smile:

## More
Forks or Stars give motivation :bowtie:
