"use strict";

const {async} = require("most-subject");
const debug = require("debug")("kafka-streams:unit:subject")

describe("Subject UNIT", function(){

    it("should be able to observe", function(){

        const subject$ = async();

        setTimeout(() => {
            [1,2,3,4,5,6,7,8,9,10].forEach(event => subject$.next(event));
            subject$.complete();
        }, 50);

        return subject$.forEach(debug);
    });
});
