// validation.test.js

import test from "node:test";
import assert from "node:assert/strict";

import { validateMessageContentFormat } from "../shared/validation/message-content-format-validator.js";
import { validateRoomCodeFormat } from "../shared/validation/room-code-format-validator.js";

test("message validator accepts content at both length boundaries", () => {
    assert.equal(validateMessageContentFormat("a").success, true);
    assert.equal(validateMessageContentFormat("x".repeat(2000)).success, true);
});

test("message validator rejects empty, oversized, and non-string content", () => {
    assert.equal(validateMessageContentFormat("").success, false);
    assert.equal(validateMessageContentFormat("x".repeat(2001)).success, false);
    assert.equal(validateMessageContentFormat(null).success, false);
});

test("room-code validator accepts an eight-character uppercase code", () => {
    assert.equal(validateRoomCodeFormat("ABCDEFGH").success, true);
});

test("room-code validator rejects incorrect length and lowercase", () => {
    assert.equal(validateRoomCodeFormat("ABCDEFG").success, false);
    assert.equal(validateRoomCodeFormat("abcdefgh").success, false);
});

for (const excludedCharacter of ["I", "O", "0", "1"]) {
    test(`room-code validator rejects excluded character ${excludedCharacter}`, () => {
        assert.equal(
            validateRoomCodeFormat(`ABCD${excludedCharacter}FGH`).success,
            false
        );
    });
}