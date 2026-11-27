// server-handlers.test.js

import test from "node:test";
import assert from "node:assert/strict";

import { Room } from "../server/models/room-model.js";
import { Membership } from "../server/models/membership-model.js";
import { User } from "../server/models/user-model.js";
import { Message } from "../server/models/message-model.js";

import { handleFetchRoomInfo } from "../server/routes/rooms/handlers/fetch-room-info-handler.js";
import { handleDeleteRoom } from "../server/routes/rooms/handlers/delete-room-handler.js";
import { handleChat } from "../server/services/socket/handlers/chat-handler.js";

function makeResponse() {
    return {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        },
    };
}

function mockRoomLookup(t) {
    let calls = 0;

    t.mock.method(Room, "findOne", (_filter, projection) => {
        calls += 1;

        if (projection) {
            return Promise.resolve({
                roomCode: "ABCD2345",
                roomName: "Example room",
            });
        }

        return {
            select: () => Promise.resolve({ _id: "room-id" }),
        };
    });

    return () => calls;
}

test("room-info handler denies a user without membership", async (t) => {
    const roomLookupCalls = mockRoomLookup(t);
    t.mock.method(Membership, "exists", async () => null);

    const res = makeResponse();
    await handleFetchRoomInfo(
        {
            params: { roomCode: "ABCD2345" },
            user: { userObjectId: "user-id" },
        },
        res
    );

    assert.equal(res.statusCode, 403);
    assert.equal(roomLookupCalls(), 1);
});

test("room-delete handler denies a non-creator without side effects", async (t) => {
    mockRoomLookup(t);
    t.mock.method(Membership, "exists", async () => null);

    let deleteCalls = 0;
    let membershipUpdateCalls = 0;
    let broadcastCalls = 0;

    t.mock.method(Room, "findOneAndUpdate", async () => {
        deleteCalls += 1;
        return null;
    });
    t.mock.method(Membership, "updateMany", async () => {
        membershipUpdateCalls += 1;
    });

    const io = {
        to() {
            broadcastCalls += 1;
            return { emit() {} };
        },
    };

    const res = makeResponse();
    await handleDeleteRoom(
        {
            body: { roomCode: "ABCD2345" },
            user: { userObjectId: "user-id" },
        },
        res,
        io
    );

    assert.equal(res.statusCode, 401);
    assert.equal(deleteCalls, 0);
    assert.equal(membershipUpdateCalls, 0);
    assert.equal(broadcastCalls, 0);
});

for (const content of ["   ", null]) {
    test(`chat handler rejects invalid content (${String(content)}) without storing or broadcasting`, async (t) => {
        let persistenceAttempts = 0;
        let broadcastAttempts = 0;

        t.mock.method(User, "exists", async () => {
            persistenceAttempts += 1;
            throw new Error("Persistence should not be reached");
        });

        const acknowledgements = [];
        const socket = {
            id: "socket-id",
            activeRoomCode: "ABCD2345",
            user: { userObjectId: "user-id", username: "Alice" },
            to() {
                broadcastAttempts += 1;
                return { emit() {} };
            },
            emit() {},
        };

        await handleChat(socket, "temporary-id", content, (result) => {
            acknowledgements.push(result);
        });

        assert.equal(acknowledgements.length, 1);
        assert.equal(acknowledgements[0].status, "error");
        assert.equal(persistenceAttempts, 0);
        assert.equal(broadcastAttempts, 0);
    });
}

test("chat handler persists a valid message before broadcasting it", async (t) => {
    const events = [];
    let storedDocument;

    t.mock.method(User, "exists", async () => ({ _id: "user-id" }));
    t.mock.method(Room, "findOne", () => ({
        select: () => Promise.resolve({ _id: "room-id" }),
    }));

    const savedMessage = {
        _id: "message-id",
        sender: "user-id",
        content: "hello",
        createdAt: new Date(),
        expiresAt: null,
    };

    t.mock.method(Message, "create", async (document) => {
        storedDocument = document;
        events.push("persist");
        return savedMessage;
    });

    const socket = {
        id: "socket-id",
        activeRoomCode: "ABCD2345",
        user: { userObjectId: "user-id", username: "Alice" },
        to() {
            return {
                emit() {
                    events.push("broadcast");
                },
            };
        },
        emit() {},
    };

    let acknowledgement;
    await handleChat(socket, "temporary-id", "  hello  ", (result) => {
        events.push("acknowledge");
        acknowledgement = result;
    });

    assert.equal(storedDocument.content, "hello");
    assert.deepEqual(events, ["persist", "broadcast", "acknowledge"]);
    assert.equal(acknowledgement.status, "success");
    assert.equal(acknowledgement.tmpId, "temporary-id");
});