"use strict";

const EventEmitter = require("events");
const MESSAGE = "message";

class KStreamBase extends EventEmitter {

    constructor(){
        super();
    }

    append(message){
        return this.emit(MESSAGE, message);
    }

    appendMulti(messages){
        messages.forEach(message => this.emit(MESSAGE, message));
        return messages.length;
    }
}

module.exports = KStreamBase;