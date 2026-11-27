// identity-validation.test.js

import test from "node:test";
import assert from "node:assert/strict";

import { validateEmailFormat } from "../shared/validation/email-format-validator.js";
import { validatePasswordFormat } from "../shared/validation/password-format-validator.js";
import { validateUsernameFormat } from "../shared/validation/username-format-validator.js";

test("email validator accepts a valid address at its maximum length", () => {
    assert.equal(validateEmailFormat("person@example.com").success, true);
    assert.equal(validateEmailFormat(`${"a".repeat(249)}@b.co`).success, true);
});

test("email validator rejects malformed, oversized, and non-string values", () => {
    assert.equal(validateEmailFormat("not-an-email").success, false);
    assert.equal(validateEmailFormat(`${"a".repeat(250)}@b.co`).success, false);
    assert.equal(validateEmailFormat(null).success, false);
});

test("password validator accepts its minimum and maximum lengths", () => {
    assert.equal(validatePasswordFormat("x".repeat(12)).success, true);
    assert.equal(validatePasswordFormat("x".repeat(128)).success, true);
});

test("password validator rejects out-of-range and non-string values", () => {
    assert.equal(validatePasswordFormat("x".repeat(11)).success, false);
    assert.equal(validatePasswordFormat("x".repeat(129)).success, false);
    assert.equal(validatePasswordFormat(null).success, false);
});

test("username validator accepts alphanumeric names at both boundaries", () => {
    assert.equal(validateUsernameFormat("abc").success, true);
    assert.equal(validateUsernameFormat("a".repeat(20)).success, true);
});

test("username validator rejects invalid characters and lengths", () => {
    assert.equal(validateUsernameFormat("ab").success, false);
    assert.equal(validateUsernameFormat("a".repeat(21)).success, false);
    assert.equal(validateUsernameFormat("valid name").success, false);
    assert.equal(validateUsernameFormat(null).success, false);
});