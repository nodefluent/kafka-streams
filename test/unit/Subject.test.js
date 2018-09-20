"use strict";

const {create} = require("most-subject");

describe("Subject UNIT", function(){

    it("should be able to observe", function(){

        const subject$ = create();

        setTimeout(() => {
            [1,2,3,4,5,6,7,8,9,10].forEach(event => subject$.next(event));
            subject$.complete();
        }, 50);

        return subject$.forEach(console.log);
    });
});
