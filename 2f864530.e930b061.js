(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{61:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return l})),n.d(t,"metadata",(function(){return o})),n.d(t,"rightToc",(function(){return c})),n.d(t,"default",(function(){return u}));var a=n(2),i=n(6),r=(n(0),n(73)),l={id:"native",title:"Native Consumer/Producer Explanation",sidebar_label:"Native Consumer/Producer Explanation"},o={unversionedId:"native",id:"native",isDocsHomePage:!1,title:"Native Consumer/Producer Explanation",description:"- kafka-streams uses sinek as underlying kafka client (although it ships its own wrapper)",source:"@site/docs/native.md",permalink:"/docs/native",editUrl:"https://github.com/nodefluent/kafka-streams/website/docs/native.md",sidebar_label:"Native Consumer/Producer Explanation",sidebar:"someSidebar",previous:{title:"Operator descriptions",permalink:"/docs/mostAPI"},next:{title:"SSL, SASL and Kerberos Support",permalink:"/docs/sslSasl"}},c=[{value:"Why would I care about the native client?",id:"why-would-i-care-about-the-native-client",children:[]},{value:"Installation",id:"installation",children:[{value:"Debian/Ubuntu",id:"debianubuntu",children:[]},{value:"MacOS",id:"macos",children:[]},{value:"Windows",id:"windows",children:[]}]},{value:"Use",id:"use",children:[]},{value:"Configuration Example",id:"configuration-example",children:[]}],s={rightToc:c};function u(e){var t=e.components,n=Object(i.a)(e,["components"]);return Object(r.b)("wrapper",Object(a.a)({},s,n,{components:t,mdxType:"MDXLayout"}),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},"kafka-streams uses ",Object(r.b)("inlineCode",{parentName:"li"},"sinek")," as underlying kafka client (although it ships its own wrapper)"),Object(r.b)("li",{parentName:"ul"},"sinek comes with 2 kafka-clients ",Object(r.b)("inlineCode",{parentName:"li"},"kafka-node")," JS and ",Object(r.b)("inlineCode",{parentName:"li"},"node-librdkafka")," C++"),Object(r.b)("li",{parentName:"ul"},"just like ",Object(r.b)("a",Object(a.a)({parentName:"li"},{href:"https://github.com/nodefluent/kafka-connect"}),"kafka-connect")," kafka-streams was built to support both clients as of version 3.0.0"),Object(r.b)("li",{parentName:"ul"},"in kafka-streams the ",Object(r.b)("inlineCode",{parentName:"li"},"KafkaFactory")," will take care of instantiating the correct client for you\nautomatically - depending on the configuration that you pass to ",Object(r.b)("inlineCode",{parentName:"li"},"KafkaStreams")),Object(r.b)("li",{parentName:"ul"},"when the ",Object(r.b)("inlineCode",{parentName:"li"},"noptions")," field is set the native client will be used, if it is not\nthe plain (default) configuration will be used for the javascript client"),Object(r.b)("li",{parentName:"ul"},"the installation of the native client might run during installation of kafka-streams\nbut it is optional, a failed installation wont affect you, when using the JS client,\nalthough it might prolong the installation process"),Object(r.b)("li",{parentName:"ul"},"the native client requires additional depdencies, such as ",Object(r.b)("inlineCode",{parentName:"li"},"librdkafka")," for example"),Object(r.b)("li",{parentName:"ul"},"you can find more details on ",Object(r.b)("a",Object(a.a)({parentName:"li"},{href:"https://github.com/nodefluent/node-sinek/blob/master/lib/librdkafka/README.md"}),"usage and installation here"))),Object(r.b)("h2",{id:"why-would-i-care-about-the-native-client"},"Why would I care about the native client?"),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},"the kafka-streams API stays the same"),Object(r.b)("li",{parentName:"ul"},"you will be able to produce & consume faster (by a magnitude compared to the JS client)"),Object(r.b)("li",{parentName:"ul"},"you can tweak the consumer and producer setup better ",Object(r.b)("a",Object(a.a)({parentName:"li"},{href:"https://github.com/edenhill/librdkafka/blob/0.9.5.x/CONFIGURATION.md"}),"full list of config params")),Object(r.b)("li",{parentName:"ul"},"you get access to features like SSL, SASL, and Kerberos"),Object(r.b)("li",{parentName:"ul"},"if tweaked correctly your process will consume less memory")),Object(r.b)("h2",{id:"installation"},"Installation"),Object(r.b)("h3",{id:"debianubuntu"},"Debian/Ubuntu"),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"sudo apt install librdkafka-dev libsasl2-dev")),Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"rm -rf node_modules")),Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"yarn")," # node-rdkafka is installed as optional dependency")),Object(r.b)("h3",{id:"macos"},"MacOS"),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"brew install librdkafka")),Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"brew install openssl")),Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"rm -rf node_modules")),Object(r.b)("li",{parentName:"ul"},Object(r.b)("inlineCode",{parentName:"li"},"yarn")," # node-rdkafka is installed as optional dependency")),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-shell"}),'  # If you have a ssl problem with an error like: `Invalid value for configuration property "security.protocol"`\n  # Add to your shell profile:\n  export CPPFLAGS=-I/usr/local/opt/openssl/include\n  export LDFLAGS=-L/usr/local/opt/openssl/lib\n  # and redo the installation.\n')),Object(r.b)("h3",{id:"windows"},"Windows"),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},"is not supported currently (might be available soon)")),Object(r.b)("h2",{id:"use"},"Use"),Object(r.b)("ul",null,Object(r.b)("li",{parentName:"ul"},"make sure to follow the installation steps first"),Object(r.b)("li",{parentName:"ul"},"the only thing left is to change your configuration object"),Object(r.b)("li",{parentName:"ul"},"looking for SSL, SASL or Kerberos examples? ",Object(r.b)("a",Object(a.a)({parentName:"li"},{href:"/docs/sslSasl"}),"go here"))),Object(r.b)("h2",{id:"configuration-example"},"Configuration Example"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-javascript"}),'const config = {\n    "noptions": {\n        "metadata.broker.list": "localhost:9092",\n        "group.id": "kafka-streams-test-native",\n        "client.id": "kafka-streams-test-name-native",\n        "event_cb": true,\n        "compression.codec": "snappy",\n        "api.version.request": true,\n        "socket.keepalive.enable": true,\n        "socket.blocking.max.ms": 100,\n        "enable.auto.commit": false,\n        "auto.commit.interval.ms": 100,\n        "heartbeat.interval.ms": 250,\n        "retry.backoff.ms": 250,\n        "fetch.min.bytes": 100,\n        "fetch.message.max.bytes": 2 * 1024 * 1024,\n        "queued.min.messages": 100,\n        "fetch.error.backoff.ms": 100,\n        "queued.max.messages.kbytes": 50,\n        "fetch.wait.max.ms": 1000,\n        "queue.buffering.max.ms": 1000,\n        "batch.num.messages": 10000\n    },\n    "tconf": {\n        "auto.offset.reset": "earliest",\n        "request.required.acks": 1\n    },\n    "batchOptions": {\n        "batchSize": 5,\n        "commitEveryNBatch": 1,\n        "concurrency": 1,\n        "commitSync": false,\n        "noBatchCommits": false\n    }\n};\n')))}u.isMDXComponent=!0},73:function(e,t,n){"use strict";n.d(t,"a",(function(){return b})),n.d(t,"b",(function(){return m}));var a=n(0),i=n.n(a);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function c(e,t){if(null==e)return{};var n,a,i=function(e,t){if(null==e)return{};var n,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)n=r[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}var s=i.a.createContext({}),u=function(e){var t=i.a.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},b=function(e){var t=u(e.components);return i.a.createElement(s.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return i.a.createElement(i.a.Fragment,{},t)}},d=i.a.forwardRef((function(e,t){var n=e.components,a=e.mdxType,r=e.originalType,l=e.parentName,s=c(e,["components","mdxType","originalType","parentName"]),b=u(n),d=a,m=b["".concat(l,".").concat(d)]||b[d]||p[d]||r;return n?i.a.createElement(m,o(o({ref:t},s),{},{components:n})):i.a.createElement(m,o({ref:t},s))}));function m(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var r=n.length,l=new Array(r);l[0]=d;var o={};for(var c in t)hasOwnProperty.call(t,c)&&(o[c]=t[c]);o.originalType=e,o.mdxType="string"==typeof e?e:a,l[1]=o;for(var s=2;s<r;s++)l[s]=n[s];return i.a.createElement.apply(null,l)}return i.a.createElement.apply(null,n)}d.displayName="MDXCreateElement"}}]);