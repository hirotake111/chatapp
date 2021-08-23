import { nanoid } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

import {
  validateGetMyChannelsPayload,
  validateGetChannelMessagesPayload,
} from "./utils";

const getMessage = (channelId: string): Message => ({
  id: uuid(),
  channelId,
  content: nanoid(),
  createdAt: Math.floor(Math.random() * 1000),
  updatedAt: Math.floor(Math.random() * 1000),
  sender: {
    id: uuid(),
    username: nanoid(),
    displayName: nanoid(),
  },
});

describe("test", () => {
  let data: any;
  beforeEach(() => {
    const channelId = uuid();
    data = {
      detail: "success",
      channel: { id: channelId, name: nanoid() },
      messages: Array.from({ length: 10 }, (_, id) => getMessage(channelId)),
    };
  });

  it("should return GetChannelMessagesPayload", () => {
    expect.assertions(1);
    expect(validateGetChannelMessagesPayload(data).detail).toEqual("success");
  });

  it("should validate detail prop", () => {
    expect.assertions(1);
    data.detail = undefined;
    try {
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid detail property: undefined");
    }
  });

  it("should validate channel prop", () => {
    expect.assertions(1);
    data.channel = undefined;
    try {
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid channel property: undefined");
    }
  });

  it("should validate channel.id prop", () => {
    expect.assertions(3);
    try {
      data.channel.id = null;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid channel.id property: null");
    }
    try {
      data.channel.id = 123;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid channel.id property: 123");
    }
    try {
      data.channel.id = "xxxx";
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid channel.id property: xxxx");
    }
  });

  it("should validate channel.name prop", () => {
    expect.assertions(2);
    try {
      data.channel.name = undefined;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid channel.name property: undefined");
    }
    try {
      data.channel.name = 123;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid channel.name property: 123");
    }
  });

  it("should validate messages prop", () => {
    expect.assertions(2);
    try {
      data.messages = undefined;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid messages property: undefined");
    }
    try {
      data.messages = "msg";
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid messages property: msg");
    }
  });

  it("should validate message.id prop", () => {
    expect.assertions(3);
    try {
      data.messages[0].id = undefined;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid message.id property: undefined");
    }
    try {
      data.messages[0].id = 123;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid message.id property: 123");
    }
    try {
      data.messages[0].id = "xxxx";
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid message.id property: xxxx");
    }
  });

  it("should validate message.channelId prop", () => {
    expect.assertions(3);
    try {
      data.messages[0].channelId = undefined;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual(
        "invalid message.channelId property: undefined"
      );
    }
    try {
      data.messages[0].channelId = 123;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid message.channelId property: 123");
    }
    try {
      data.messages[0].channelId = "xxxx";
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid message.channelId property: xxxx");
    }
  });

  it("should validate message.content prop", () => {
    expect.assertions(2);
    try {
      data.messages[0].content = undefined;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid message.content property: undefined");
    }
    try {
      data.messages[0].content = 123;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid message.content property: 123");
    }
  });

  it("should validate message.sender prop", () => {
    expect.assertions(1);
    try {
      data.messages[0].sender = undefined;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid message.sender property: undefined");
    }
  });

  it("should validate message.sender.id prop", () => {
    expect.assertions(3);
    try {
      data.messages[0].sender.id = undefined;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual(
        "invalid message.sender.id property: undefined"
      );
    }
    try {
      data.messages[0].sender.id = 123;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid message.sender.id property: 123");
    }
    try {
      data.messages[0].sender.id = "xxxx";
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual("invalid message.sender.id property: xxxx");
    }
  });

  it("should validate message.sender.username prop", () => {
    expect.assertions(2);
    try {
      data.messages[0].sender.username = undefined;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual(
        "invalid message.sender.username property: undefined"
      );
    }
    try {
      data.messages[0].sender.username = 123;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual(
        "invalid message.sender.username property: 123"
      );
    }
  });

  it("should validate message.sender.displayName prop", () => {
    expect.assertions(2);
    try {
      data.messages[0].sender.displayName = undefined;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual(
        "invalid message.sender.displayName property: undefined"
      );
    }
    try {
      data.messages[0].sender.displayName = 123;
      validateGetChannelMessagesPayload(data);
    } catch (e) {
      expect(e.message).toEqual(
        "invalid message.sender.displayName property: 123"
      );
    }
  });
});
