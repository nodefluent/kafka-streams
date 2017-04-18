"use strict";

const Promise = require("bluebird");
const most = require("most");

class Window {

	constructor(container) {
		this.container = container || [];
	}

	execute(element){
		this.container.push(element.value);
	}

	asStream(){
		return most.from(this.container);
	}
}

module.exports = Window;
