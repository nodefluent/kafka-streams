"use strict";

const {async: createSubject} = require("most-subject");

class Window {

	constructor(container, collect = false) {
        this.container = container || [];
		this.container$ = createSubject();
        this.collect = collect; //TODO implement non-collect (instant stream) mode
	}

	getStream(){
        return this.container$;
    }

	execute(element, leaveEncapsulated){
		this.container.push(leaveEncapsulated ? element : element.value);
	}

	writeToStream(){
		this.container.forEach(event => this.container$.next(event));
        this.container$.complete();
	}
}

module.exports = Window;
