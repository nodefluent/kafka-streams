"use strict";

const { async: createSubject } = require("most-subject");

/**
 * used to build windows of key value states
 * in a stream
 */
class Window {

    constructor(container, collect = false) {
        this.container = container || [];
        this.container$ = createSubject();
        this.collect = collect;
    }

    getStream() {
        return this.container$;
    }

    execute(element, leaveEncapsulated = true) {
        const ele = leaveEncapsulated ? element : element.value;
        if (this.collect) {
            this.container.push(ele);
        } else {
            this.container$.next(ele);
        }
    }

    writeToStream() {
        if (this.collect) {
            this.container.forEach(event => this.container$.next(event));
        } else {
            // already written to stream
        }
    }

    flush() {
        this.container$.complete();
    }
}

module.exports = Window;
