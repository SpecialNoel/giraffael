// api-fetch.test.js

import test from "node:test";
import assert from "node:assert/strict";

import { apiFetch, parseResponse } from "../public/utils/api.js";

test("apiFetch refreshes credentials and retries after a 401", async (t) => {
    const calls = [];
    const finalResponse = { status: 200, ok: true };

    t.mock.method(globalThis, "fetch", async (url, options) => {
        calls.push({ url: String(url), options });

        if (calls.length === 1) {
            return {
                status: 401,
                json: async () => ({
                    error: { code: "EXPIRED_ACCESS_TOKEN" },
                }),
            };
        }

        if (calls.length === 2) {
            return { status: 200, ok: true };
        }

        return finalResponse;
    });

    const options = { method: "POST", body: JSON.stringify({ roomName: "Test" }) };
    const response = await apiFetch("/rooms/create", options);

    assert.equal(response, finalResponse);
    assert.equal(calls.length, 3);
    assert.equal(calls[0].url, "/rooms/create");
    assert.equal(calls[1].url, "/signin/refresh");
    assert.equal(calls[2].url, "/rooms/create");

    assert.equal(calls[0].options.credentials, "include");
    assert.equal(calls[0].options.headers["Content-Type"], "application/json");
    assert.deepEqual(calls[2].options, calls[0].options);
});

test("apiFetch does not refresh for non-401 responses", async (t) => {
    const forbiddenResponse = { status: 403, ok: false };
    let callCount = 0;

    t.mock.method(globalThis, "fetch", async () => {
        callCount += 1;
        return forbiddenResponse;
    });

    assert.equal(await apiFetch("/rooms/private"), forbiddenResponse);
    assert.equal(callCount, 1);
});

test("parseResponse preserves the server error message, code, and status", async () => {
    const response = {
        status: 403,
        json: async () => ({
            success: false,
            error: {
                code: "NOT_MEMBER_OF_ROOM",
                message: "Not a room member",
            },
        }),
    };

    await assert.rejects(parseResponse(response), (error) => {
        assert.equal(error.message, "Not a room member");
        assert.equal(error.code, "NOT_MEMBER_OF_ROOM");
        assert.equal(error.status, 403);
        return true;
    });
});