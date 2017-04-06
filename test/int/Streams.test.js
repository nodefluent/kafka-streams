"use strict";

const expect = require("expect.js");

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
        expect(1+1).to.be.equal(2);
        done();
    });
});