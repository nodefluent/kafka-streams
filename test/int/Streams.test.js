"use strict";

const assert = require("assert");

const {} = require("./../../index.js");
const config = require("./../test-config.js");

describe("Streams Integration", function() {

    before(function (done) {
        done();
    });

    after(function (done) {
        done();
    });

    it("should be able to test the truth", function (done) {
        //TODO integration test with kafka
        assert.equal(1+1, 2);
        done();
    });
});