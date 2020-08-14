(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{64:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return s})),a.d(t,"metadata",(function(){return i})),a.d(t,"rightToc",(function(){return l})),a.d(t,"default",(function(){return m}));var n=a(2),r=a(6),o=(a(0),a(73)),s={id:"quickStart",title:"Quick Start Tutorial",sidebar_label:"Quick Start Tutorial"},i={unversionedId:"quickStart",id:"quickStart",isDocsHomePage:!0,title:"Quick Start Tutorial",description:"Requirements",source:"@site/docs/quick-start.md",permalink:"/docs/",editUrl:"https://github.com/nodefluent/kafka-streams/tree/master/website/docs/quick-start.md",sidebar_label:"Quick Start Tutorial",sidebar:"someSidebar",next:{title:"Message 'to' and 'from' Apache Kafka",permalink:"/docs/handlingMessageSchemas"}},l=[{value:"Requirements",id:"requirements",children:[]},{value:"Configuration",id:"configuration",children:[]},{value:"The API",id:"the-api",children:[]}],c={rightToc:l};function m(e){var t=e.components,a=Object(r.a)(e,["components"]);return Object(o.b)("wrapper",Object(n.a)({},c,a,{components:t,mdxType:"MDXLayout"}),Object(o.b)("h2",{id:"requirements"},"Requirements"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},"Before you get started, make sure you have installed NodeJS (at least version 6.10, better latest)\nrunning on your system and a local Zookeeper (:2181) and Kafka Broker (:9092) (if you are running\nthese services elsewhere, make sure to adapt the config settings)"),Object(o.b)("li",{parentName:"ul"},"You can find the latest NodeJS version ",Object(o.b)("a",Object(n.a)({parentName:"li"},{href:"https://nodejs.org/en/download/"}),"here")," (if you did not know already)"),Object(o.b)("li",{parentName:"ul"},"When you are in need of a ",Object(o.b)("inlineCode",{parentName:"li"},"local")," kafka setup, just take a look at ",Object(o.b)("inlineCode",{parentName:"li"},"/kafka-setup/start.sh")," (you will need docker and docker-compose for this to work)"),Object(o.b)("li",{parentName:"ul"},"Installing kafka-streams in an existing project (directory with package.json) is quite easy: ",Object(o.b)("inlineCode",{parentName:"li"},"npm install --save kafka-streams"))),Object(o.b)("h2",{id:"configuration"},"Configuration"),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},"NOTE: as of version 3.0.0 node-kafka-streams supports an additional ",Object(o.b)("inlineCode",{parentName:"li"},"librdkafka")," client,\nthat offers better performance, configuration tweaking and especially features like\nSASL and Kerberos ",Object(o.b)("a",Object(n.a)({parentName:"li"},{href:"/docs/native"}),"checkout the native docs")," for more details.\n",Object(o.b)("strong",{parentName:"li"},"We really want to encourage you to always use the native clients if possible."))),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-es6"}),'{\n    "noptions": {\n        "metadata.broker.list": "localhost:9092",\n        "group.id": "kafka-streams-test-native",\n        "client.id": "kafka-streams-test-name-native",\n        "event_cb": true,\n        "compression.codec": "snappy",\n        "api.version.request": true,\n        "socket.keepalive.enable": true,\n        "socket.blocking.max.ms": 100,\n        "enable.auto.commit": false,\n        "auto.commit.interval.ms": 100,\n        "heartbeat.interval.ms": 250,\n        "retry.backoff.ms": 250,\n        "fetch.min.bytes": 100,\n        "fetch.message.max.bytes": 2 * 1024 * 1024,\n        "queued.min.messages": 100,\n        "fetch.error.backoff.ms": 100,\n        "queued.max.messages.kbytes": 50,\n        "fetch.wait.max.ms": 1000,\n        "queue.buffering.max.ms": 1000,\n        "batch.num.messages": 10000\n    },\n    "tconf": {\n        "auto.offset.reset": "earliest",\n        "request.required.acks": 1\n    },\n    "batchOptions": {\n        "batchSize": 5,\n        "commitEveryNBatch": 1,\n        "concurrency": 1,\n        "commitSync": false,\n        "noBatchCommits": false\n    }\n}\n')),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"Config is a simple object that is being passed to the constructor of\nKafkaStreams, which will result an a new Factory for KStreams and KTables on the\noutside and KafkaClients and KStorages on the inside.")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"The sub-object options supports all settings provided by the ",Object(o.b)("inlineCode",{parentName:"p"},"kafka-node"),"\nmodule."))),Object(o.b)("h2",{id:"the-api"},"The API"),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-es6"}),'const {KafkaStreams} = require("kafka-streams");\n')),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},'Understanding the KafkaStreams object.\nA KafkaStreams instance is the representation of a classical "factory", which will enable you to create\nmultiple instances of KStreams and KTables using the same configuration for KStorages and KafkaClients easily.\nThat is why you have to pass a config object to the constructor of KafkaStreams.')),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-es6"}),'const kafkaStreams = new KafkaStreams(config);\nkafkaStreams.on("error", (error) => console.error(error));\n')),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},"Creating a new KStream (change-log stream representation) via:")),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-es6"}),'const kafkaTopicName = "my-topic";\nconst stream = kafkaStreams.getKStream(kafkaTopicName);\nstream.forEach(message => console.log(message));\nstream.start().then(() => {\n    console.log("stream started, as kafka consumer is ready.");\n}, error => {\n    console.log("streamed failed to start: " + error);\n});\n')),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"Using the factory as base, its simple to create new streams, you can pass a\ntopic name as string to ",Object(o.b)("inlineCode",{parentName:"p"},"getKStream()")," and calling ",Object(o.b)("inlineCode",{parentName:"p"},".start()")," (which returns a Promise,\nthat will resolve when the Kafka Client is connected & ready to consume messages).")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"Please Note: that you do not have to pass a topic to ",Object(o.b)("inlineCode",{parentName:"p"},"getKStream()")," anymore,\nyou can also simply call ",Object(o.b)("inlineCode",{parentName:"p"},'stream.from("topicName")')," later. (Also multiple times\nto stream from multiple Kafka topics).")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"We highly suggest to read the ",Object(o.b)("a",Object(n.a)({parentName:"p"},{href:"/docs/handlingMessageSchemas"}),"Message Schemas to and from Kafka guide")))),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-es6"}),'//format of an incoming kafka message (equals to kafka-node\'s format)\n{\n    topic: "",\n    value: "",\n    offset: 0,\n    partition: 0,\n    highWaterOffset: 6,\n    key: -1\n}\n')),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"When using ",Object(o.b)("inlineCode",{parentName:"p"},'stream$.to("topic-name")')," to stream the final events of your stream back to another\nKafka Topic, the use of ",Object(o.b)("inlineCode",{parentName:"p"},".start()")," will also cause another Kafka Client to be created and connected\nas producer, the promise will then resolve after both, the consumer and the producer have been connected\nto the broker successfully.")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"Keep in mind that messages which will be produced to Kafka via ",Object(o.b)("inlineCode",{parentName:"p"},".to()"),' will have to be in a string or\nobject format depending on the type: "send", "buffer", "bufferFormat" you pass. Per default the type will be\n"send" which requires your events to be a string when reaching the end, using "buffer" or "bufferFormat" will require\nyour events to be objects when reaching the end of the stream.'))),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-es6"}),'const PRODUCE_TYPES = {\n    SEND: "send",\n    BUFFER: "buffer",\n    BUFFER_FORMAT: "buffer_format"\n};\n\n.to(topic, outputPartitionsCount = 1, produceType = "send", version = 1, compressionType = 0, producerErrorCallback = null)\n')),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"You can always call ",Object(o.b)("inlineCode",{parentName:"p"},".getKStream()")," without a topic parameter and there is no requirement to call\n",Object(o.b)("inlineCode",{parentName:"p"},".to(..)")," on a stream - leaving you with an empty stream neither connected as consumer nor producer.")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"Calling ",Object(o.b)("inlineCode",{parentName:"p"},".writeToStream(message)")," will always enable to to add messages/events to a stream manually.")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"By default your node app will keep running, as long as the Kafka Clients in your streams are still connected.\nIf you want to close a single stream and its clients, simply call ",Object(o.b)("inlineCode",{parentName:"p"},"stream$.close()")," if you want to close any Kafka Clients\nrelated to streams created with a KafkaStreams instance, simply call ",Object(o.b)("inlineCode",{parentName:"p"},"kafkaStreams.closeAll()"),".")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"You can apply any kind of stream operations to a KStream or KTable instance to get a better feeling of how they\ncan be combined you should take a look at the ",Object(o.b)("inlineCode",{parentName:"p"},"/examples")," folder.")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"By default a KStream instance will always stay open, until you call a completing operation such as ",Object(o.b)("inlineCode",{parentName:"p"},".take()")," or ",Object(o.b)("inlineCode",{parentName:"p"},".until()"),". This is through the nature of most.js streams; which builds the base for any streaming operations, therefore the APIs are very similiar besides the fact that KSteams and KTables ",Object(o.b)("inlineCode",{parentName:"p"},"DO NOT")," return a new instance on every operation e.g. ",Object(o.b)("inlineCode",{parentName:"p"},"stream$.filter(() => {})")," (the internal most.js stream is indeed a new one, but the KStream or KTable instance stays the same) But for window and merge|join|combine operations, KStreams and KTables have to return a ",Object(o.b)("inlineCode",{parentName:"p"},"NEW")," instance."))),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-es6"}),'const firstStream = kafkaStreams.getKStream("first-topic");\nconst secondStream = kafkaStreams.getKStream("second-topic");\nconst mergedStream = firstStream.merge(secondStream); //new KStream instance\n\nPromise.all([\n    firstStream.start(),\n    secondStream.start(),\n    mergedStream.to("merged-topic")\n    ])\n.then(() => {\n    console.log("both consumers and the producer have connected.");\n});\n')),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"Combining streams is simple, keep in mind that ",Object(o.b)("inlineCode",{parentName:"p"},".to()"),", just like ",Object(o.b)("inlineCode",{parentName:"p"},".start()"),', returns a Promise, when\nusing "to" on a merged stream it will indeed take a little longer as, when it is being used with "start"\nas it has to create a new Kafka Client and Producer Connection for the merged stream. However you must not\nuse ',Object(o.b)("inlineCode",{parentName:"p"},".start()")," on a merged stream.")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"It is also important to understand the concept of observers, when using streams. E.g.:"))),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-es6"}),'const stream = kafkaStreams.getKStream("my-topic");\nstream.map(..).filter(..).tap(message => console.log(message));\nstream.start();\n')),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},'You will never see a log in the console using the code above, even though the kafka topic has messages on it, your filter still leaves messages in the stream and you called "start". And the reason for that is, because the stream is missing an observer. You could either add ',Object(o.b)("inlineCode",{parentName:"p"},".drain()")," or ",Object(o.b)("inlineCode",{parentName:"p"},".forEach(m => {})")," to the end of the stream to attach an observer.\nKeep in mind, that ",Object(o.b)("inlineCode",{parentName:"p"},".to()")," always attaches an observer as well.")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"When using ",Object(o.b)("inlineCode",{parentName:"p"},".reduce()"),", ",Object(o.b)("inlineCode",{parentName:"p"},".forEach()")," or ",Object(o.b)("inlineCode",{parentName:"p"},".drain()")," they return a Promise that will resolve when the stream completes, running this on stream will require 2 things: 1. you should probably only call them on the end (as multiple observers might cause the messages to be emitted multiple times) of a stream. 2. if you are awaiting the resolution of the promise you will have to cause the stream to complete first e.g. by calling ",Object(o.b)("inlineCode",{parentName:"p"},".take()")," before. This behaviour is fundamental to observables.")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"Creating a new KTable (table (last state) representation) via:"))),Object(o.b)("pre",null,Object(o.b)("code",Object(n.a)({parentName:"pre"},{className:"language-es6"}),'const kafkaTopicName = "my-topic";\nconst toKv = message => {\n    const msg = message.split(",");\n    return {\n        key: msg[0],\n        value: msg[1]\n    };\n};\nconst table = kafkaStreams.getKTable(kafkaTopicName, toKv);\ntable.consumeUntilCount(100, () => {\n    console.log("topic has been consumed until count of 100 messages.");\n});\ntable.start().then(() => {\n    console.log("table stream started, as kafka consumer is ready.");\n}, error => {\n    console.log("table streamed failed to start: " + error);\n});\n')),Object(o.b)("ul",null,Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"The main difference between a KStream and KTable is that the table can only represent a certain moment or state of the total events on a stream (messages on a Kafka Topic) as it has to complete before the table can be build and used. You can either do that by awaiting time ",Object(o.b)("inlineCode",{parentName:"p"},".consumeUntilMs(milliseconds)")," or counting messages ",Object(o.b)("inlineCode",{parentName:"p"},".consumeUntilCount(messageCount)")," or alternatively run until a certain offset is reached with ",Object(o.b)("inlineCode",{parentName:"p"},".consumeUntilLatestOffset()"),".")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"Additionally a KTable needs a second parameter during creation (compared to a KStream) it needs a function that turns any message it might consume from the topic into a {key, value} pair, as a table can only be build on KV pairs.")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"When a table has been built you can access the internal KStorage map, which holds the state of the latest key values.\nVia ",Object(o.b)("inlineCode",{parentName:"p"},".getTable().then(table => {})")," you can also trigger a replay of all KV pairs in the table at any time after completion by calling ",Object(o.b)("inlineCode",{parentName:"p"},".replay()"),".")),Object(o.b)("li",{parentName:"ul"},Object(o.b)("p",{parentName:"li"},"A table can be merged with a KStream or another KTable, keep in mind that when merging 2 KTables their storages will be merged, resulting a combination of both internal KStorage maps. Where the left hand table's values might be overwritten by the right hand side, if both contain the equal keys."))))}m.isMDXComponent=!0},73:function(e,t,a){"use strict";a.d(t,"a",(function(){return b})),a.d(t,"b",(function(){return d}));var n=a(0),r=a.n(n);function o(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function s(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?s(Object(a),!0).forEach((function(t){o(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):s(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function l(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var c=r.a.createContext({}),m=function(e){var t=r.a.useContext(c),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},b=function(e){var t=m(e.components);return r.a.createElement(c.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return r.a.createElement(r.a.Fragment,{},t)}},u=r.a.forwardRef((function(e,t){var a=e.components,n=e.mdxType,o=e.originalType,s=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),b=m(a),u=n,d=b["".concat(s,".").concat(u)]||b[u]||p[u]||o;return a?r.a.createElement(d,i(i({ref:t},c),{},{components:a})):r.a.createElement(d,i({ref:t},c))}));function d(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var o=a.length,s=new Array(o);s[0]=u;var i={};for(var l in t)hasOwnProperty.call(t,l)&&(i[l]=t[l]);i.originalType=e,i.mdxType="string"==typeof e?e:n,s[1]=i;for(var c=2;c<o;c++)s[c]=a[c];return r.a.createElement.apply(null,s)}return r.a.createElement.apply(null,a)}u.displayName="MDXCreateElement"}}]);