import {
  getFakeChannel,
  getFakeMessage,
  getFakeUser,
  getFakeMessageWithNoId,
  getFakeState,
} from "./testHelpers";

describe("getFakeUser", () => {
  it("should return a fake user", () => {
    expect.assertions(3);
    const user = getFakeUser();
    expect(typeof user.id).toEqual("string");
    expect(typeof user.username).toEqual("string");
    expect(typeof user.displayName).toEqual("string");
  });
});

describe("getFakeMessageWithNoId", () => {
  it("should return a fake message with no id", () => {
    expect.assertions(7);
    const msg = getFakeMessageWithNoId();
    expect(typeof msg.channelId).toEqual("string");
    expect(typeof msg.content).toEqual("string");
    expect(typeof msg.createdAt).toEqual("number");
    expect(typeof msg.updatedAt).toEqual("number");
    expect(typeof msg.sender.id).toEqual("string");
    expect(typeof msg.sender.username).toEqual("string");
    expect(typeof msg.sender.displayName).toEqual("string");
  });
});

describe("getFakeMessage", () => {
  it("should return a fake message", () => {
    expect.assertions(2);
    const msg = getFakeMessage();
    expect(typeof msg.id).toEqual("string");
    expect(typeof msg.channelId).toEqual("string");
  });
});

describe("getFakeChannel", () => {
  it("should return a fake channel", () => {
    expect.assertions(6);
    const ch = getFakeChannel();
    expect(typeof ch.id).toEqual("string");
    expect(typeof ch.name).toEqual("string");
    expect(typeof ch.createdAt).toEqual("number");
    expect(typeof ch.updatedAt).toEqual("number");
    expect(ch.users.length).toEqual(3);
    expect(ch.messages.length).toEqual(3);
  });
});

describe("getFakeState", () => {
  it("should return a fake state object", () => {
    expect.assertions(4);
    const state = getFakeState();
    expect(state.user).toBeTruthy();
    expect(state.channel).toBeTruthy();
    expect(state.newChannel).toBeTruthy();
    expect(state.message).toBeTruthy();
  });
});
