(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{62:function(e,t,a){"use strict";a.r(t),a.d(t,"frontMatter",(function(){return s})),a.d(t,"metadata",(function(){return c})),a.d(t,"rightToc",(function(){return i})),a.d(t,"default",(function(){return u}));var n=a(2),o=a(6),r=(a(0),a(73)),s={id:"handlingMessageSchemas",title:"Message 'to' and 'from' Apache Kafka",sidebar_label:"Message 'to' and 'from' Apache Kafka"},c={unversionedId:"handlingMessageSchemas",id:"handlingMessageSchemas",isDocsHomePage:!1,title:"Message 'to' and 'from' Apache Kafka",description:"Handling Message Schemas",source:"@site/docs/handling-message-schemas.md",permalink:"/docs/handlingMessageSchemas",editUrl:"https://github.com/nodefluent/kafka-streams/tree/master/website/docs/handling-message-schemas.md",sidebar_label:"Message 'to' and 'from' Apache Kafka",sidebar:"someSidebar",previous:{title:"Quick Start Tutorial",permalink:"/docs/"},next:{title:"API info",permalink:"/docs/ksAPI"}},i=[{value:"Handling Message Schemas",id:"handling-message-schemas",children:[]},{value:"Consume Schema (consuming payloads from Kafka topics)",id:"consume-schema-consuming-payloads-from-kafka-topics",children:[]},{value:"Produce Schema (producing back to Kafka topics)",id:"produce-schema-producing-back-to-kafka-topics",children:[]}],l={rightToc:i};function u(e){var t=e.components,a=Object(o.a)(e,["components"]);return Object(r.b)("wrapper",Object(n.a)({},l,a,{components:t,mdxType:"MDXLayout"}),Object(r.b)("h2",{id:"handling-message-schemas"},"Handling Message Schemas"),Object(r.b)("p",null,"The following document should help you to understand\nhow the internal streams are connected to Kafka Consumers and Producers\nand the schemes of Kafka Message."),Object(r.b)("h2",{id:"consume-schema-consuming-payloads-from-kafka-topics"},"Consume Schema (consuming payloads from Kafka topics)"),Object(r.b)("p",null,"Lets assume this very simple stream that consumes a kafka topic:"),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),'"use strict";\nconst {KafkaStreams} = require("kafka-streams");\nconst factory = new KafkaStreams({noptions: {/* your kafka config here */}});\n\nconst myConsumerStream =\n    factory.getKStream()\n    .from("my-topic")\n    .forEach(console.log);\n\nmyConsumerStream.start();\n')),Object(r.b)("p",null,"The events you would see in the console, would look like this:"),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-json"}),'{ "value": [21, 34, 12],\n  "size": 5,\n  "key": [21, 34, 12, 14, 12],\n  "topic": "my-output-topic",\n  "offset": 46,\n  "partition": 0,\n  "timestamp": 1524412800216 }\n')),Object(r.b)("p",null,"As you can see it resembles a Kafka Message, including offset and partition.\nAlso topic, in case you are consuming multiple at the same time.\nTo get those bytes into strings, we got you covered."),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),'const myConsumerStream =\n    factory.getKStream()\n    .from("my-topic")\n    .mapBufferKeyToString() //key: Buffer -> key: string\n    .mapBufferValueToString() //value: Buffer -> value: string\n    .forEach(console.log);\n\nmyConsumerStream.start();\n')),Object(r.b)("p",null,"Would look like this:"),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-json"}),'{ "value": "bla 2",\n  "size": 5,\n  "key": "c7f21c04-a353-4c19-980a-cca65f50db9a",\n  "topic": "my-output-topic",\n  "offset": 46,\n  "partition": 0,\n  "timestamp": 1524412800216 }\n')),Object(r.b)("p",null,"In case your value (which it is most likely) is a JSON object, you can simply\ncall this single DSL method that will also take care of the buffers:"),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),'const myConsumerStream =\n    factory.getKStream()\n    .from("my-topic")\n    .mapJSONConvenience() //{key: Buffer, value: Buffer} -> {key: string, value: Object}\n    .forEach(console.log);\n\nmyConsumerStream.start();\n')),Object(r.b)("p",null,"Events would look like this:"),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-json"}),'{ "value": { "your": "payload object", "is": "here" },\n  "size": 5,\n  "key": "c7f21c04-a353-4c19-980a-cca65f50db9a",\n  "topic": "my-output-topic",\n  "offset": 46,\n  "partition": 0,\n  "timestamp": 1524412800216 }\n')),Object(r.b)("p",null,"And lets say you only care about the values of the topic, we even got something for that:"),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),'const myConsumerStream =\n    factory.getKStream()\n    .from("my-topic")\n    .mapJSONConvenience()\n    .mapWrapKafkaValue() //{value} -> value\n    .forEach(console.log);\n\nmyConsumerStream.start();\n')),Object(r.b)("p",null,"Events would now look like this:"),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-json"}),'{ "your": "payload object", "is": "here" }\n')),Object(r.b)("h2",{id:"produce-schema-producing-back-to-kafka-topics"},"Produce Schema (producing back to Kafka topics)"),Object(r.b)("p",null,"Lets talk about getting events back out there on a Kafka topic again.\nThere are 2 things you will need to know:"),Object(r.b)("ol",null,Object(r.b)("li",{parentName:"ol"},"The produceType setting describes how the message format should look like.\nThere are three available types. You can set the type as third parameter of ",Object(r.b)("inlineCode",{parentName:"li"},'stream.to("topic", partitionCount, "send")'))),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},"1.1 send: Raw messages, no changes to the value, can be any type."),Object(r.b)("li",{parentName:"ul"},"1.2 buffer: Gives message values a certain format {id, key, payload, timestamp, version} (requires event to be an object)"),Object(r.b)("li",{parentName:"ul"},"1.3 bufferFormat: Gives message values a certain format {id, key, payload, timestamp, version, type} (requires event to be an object)")),Object(r.b)("ol",{start:2},Object(r.b)("li",{parentName:"ol"},"Any single (stream) event can overwrite the default settings that you have configured with the ",Object(r.b)("inlineCode",{parentName:"li"},".to()")," call.\nIf it brings a key, value object structure. Like this one:")),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-json"}),'{ \n  "key": "123",\n  "value": "{}",\n  "topic": "my-output-topic",\n  "partition": 0,\n  "partitionKey": null,\n  "opaqueKey": null\n}\n')),Object(r.b)("p",null,"These will allow you to overwrite key, partition or topic for every single event.\nAdditionally you can set partitionKey (which will choose a deterministic partition based on the key).\nMake sure to pass the total amount of partitions as second parameter to ",Object(r.b)("inlineCode",{parentName:"p"},'.to("topic", 30)'),".\nAnd also opaqueKey, which is a second identifier that is passed through the delivery reports."),Object(r.b)("p",null,'By default, just the whole stream event will be passed as Kafka message value using the "send" produceType.'),Object(r.b)("p",null,"Lets take a look at how easy it is to get a stream event (single valued) back into a Kafka message schema."),Object(r.b)("pre",null,Object(r.b)("code",Object(n.a)({parentName:"pre"},{className:"language-javascript"}),'const myConsumerStream =\n    factory.getKStream()\n    .from("my-topic")\n    .mapJSONConvenience()\n    .mapWrapKafkaValue()\n    .tap(console.log)\n    .wrapAsKafkaValue() //value -> {key, value, ..}\n    .to("output-topic");\n\nmyConsumerStream.start();\n')))}u.isMDXComponent=!0},73:function(e,t,a){"use strict";a.d(t,"a",(function(){return p})),a.d(t,"b",(function(){return f}));var n=a(0),o=a.n(n);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function s(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function c(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?s(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):s(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function i(e,t){if(null==e)return{};var a,n,o=function(e,t){if(null==e)return{};var a,n,o={},r=Object.keys(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||(o[a]=e[a]);return o}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(n=0;n<r.length;n++)a=r[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(o[a]=e[a])}return o}var l=o.a.createContext({}),u=function(e){var t=o.a.useContext(l),a=t;return e&&(a="function"==typeof e?e(t):c(c({},t),e)),a},p=function(e){var t=u(e.components);return o.a.createElement(l.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return o.a.createElement(o.a.Fragment,{},t)}},b=o.a.forwardRef((function(e,t){var a=e.components,n=e.mdxType,r=e.originalType,s=e.parentName,l=i(e,["components","mdxType","originalType","parentName"]),p=u(a),b=n,f=p["".concat(s,".").concat(b)]||p[b]||m[b]||r;return a?o.a.createElement(f,c(c({ref:t},l),{},{components:a})):o.a.createElement(f,c({ref:t},l))}));function f(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var r=a.length,s=new Array(r);s[0]=b;var c={};for(var i in t)hasOwnProperty.call(t,i)&&(c[i]=t[i]);c.originalType=e,c.mdxType="string"==typeof e?e:n,s[1]=c;for(var l=2;l<r;l++)s[l]=a[l];return o.a.createElement.apply(null,s)}return o.a.createElement.apply(null,a)}b.displayName="MDXCreateElement"}}]);