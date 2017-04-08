# kafka-streams
kafka-streams :octopus: equivalent for nodejs :turtle: :rocket:

build on super fast :fire: observables using most.js :metal:

ships with sinek :pray: for backpressure

overwriteable local-storage solution allows for any kind of ETL datastore e.g. RocksDB, Redis, Postgres..

async (Promises) and sync stream operators e.g. `$stream.map()` or `$stream.asyncMap()`

super easy API :trollface:

## Progress Overview (Port Adaption)

- [x] core structure
- [ ] complex stream join structure
- [x] word-count example
- [x] local-storage for etl actions
- [ ] default RocksDB storage for global etl actions
- [ ] local-storage back-up to kafka topic
- [ ] re-load back-up kafka topic of local-storage
- [ ] kafka client implementation
- [ ] KTable replay to Kafka (produce)
- [ ] sinek implementation for backpressure
- [ ] auto-json payloads (read-map/write-map)
- [ ] additional access functions to states of local-storage
- [ ] additional access functions to KTable instances
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
- [ ] take*
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
- [ ] ..
- Want more? Feel free to open an issue :cop:

## Are we ready for production yet?
- No, please have some more patience :smile:

## More
- Forks or Stars give motivation :bowtie:
