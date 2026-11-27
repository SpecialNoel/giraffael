// room-api.test.js

import test from "node:test";
import assert from "node:assert/strict";

import { fetchOlderMessages } from "../public/services/dashboard/room/room-api.js";

function mockFetch(t) {
    const calls = [];

    t.mock.method(globalThis, "fetch", async (url, options) => {
        calls.push({ url: String(url), options });
        return { status: 200 };
    });

    return calls;
}

test("fetchOlderMessages serializes the cursor as a query parameter", async (t) => {
    const calls = mockFetch(t);
    const cursor = {
        createdAt: "2026-11-26T20:00:00.000Z",
        messageObjectId: "507f1f77bcf86cd799439011",
    };

    await fetchOlderMessages("ABCD2345", cursor);

    assert.equal(calls.length, 1);

    const url = new URL(calls[0].url, "http://localhost");
    assert.equal(url.pathname, "/rooms/ABCD2345/messages");
    assert.equal(url.searchParams.get("cursor"), JSON.stringify(cursor));
});

test("fetchOlderMessages omits the cursor on the initial request", async (t) => {
    const calls = mockFetch(t);

    await fetchOlderMessages("ABCD2345", null);

    const url = new URL(calls[0].url, "http://localhost");
    assert.equal(url.pathname, "/rooms/ABCD2345/messages");
    assert.equal(url.searchParams.has("cursor"), false);
});