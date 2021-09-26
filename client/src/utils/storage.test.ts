import {
  describe,
  jest,
  it,
  expect,
  beforeAll,
  beforeEach,
} from "@jest/globals";
import { nanoid } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import { GetChannelMessagesPayload } from "../actions/channelActions";
import { storage } from "./storage";

let channelId: string;
let messages: Message[];
let data: GetChannelMessagesPayload;

let fakeLocalStorage: { [key: string]: string };

const fakeLocalStorageAPI = {
  getItem: (key: string) => {
    return fakeLocalStorage[key] || null;
  },
  setItem: (key: string, value: string) => {
    fakeLocalStorage[key] = value;
  },
};

beforeAll(() => {
  Object.defineProperty(window, "localStorage", { value: fakeLocalStorageAPI });
});

beforeEach(() => {
  fakeLocalStorage = {};
  channelId = uuid();
  messages = [
    {
      id: uuid(),
      channelId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sender: { id: uuid(), username: nanoid(), displayName: nanoid() },
      content: "hello world",
    },
  ];
  data = {
    channel: {
      id: channelId,
      name: nanoid(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      users: [
        { id: uuid(), displayName: nanoid() },
        { id: uuid(), displayName: nanoid() },
      ],
      messages,
    },
    messages,
  };
});

describe("getChannel", () => {
  it("should return channel data in local storage", () => {
    expect.assertions(1);
    // set mock data
    fakeLocalStorageAPI.setItem(
      "channels",
      JSON.stringify({ [channelId]: data })
    );
    expect(storage.getChannel(channelId)).toEqual(data);
  });

  it("should return {} if local storage doesn't have key 'channels'", () => {
    expect.assertions(1);
    expect(storage.getChannel(channelId)).toEqual({});
  });

  it("should return {} if value for channel ID key is empty object", () => {
    expect.assertions(1);
    // set mock data
    fakeLocalStorageAPI.setItem("channels", JSON.stringify({}));
    expect(storage.getChannel(uuid())).toEqual({});
  });

  it("should return {} if channel ID doesn't eixst in local storage", () => {
    expect.assertions(1);
    // set mock data
    fakeLocalStorageAPI.setItem(
      "channels",
      JSON.stringify({ [channelId]: data })
    );
    expect(storage.getChannel(uuid())).toEqual({});
  });

  it("should throw an error if retrieved data is invalid format", () => {
    expect.assertions(1);
    // set mock data
    fakeLocalStorageAPI.setItem(
      "channels",
      JSON.stringify({
        [channelId]: {
          channel: { ...data.channel, createdAt: "now" },
          messages: { ...data.messages },
        },
      })
    );
    try {
      storage.getChannel(channelId);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          'validation error: key "createdAt" should be of type "number" but "string"'
        );
    }
  });
});

describe("setChannel", () => {
  it("should set GetChannelMessagesPayload", () => {
    expect.assertions(1);
    // set data
    storage.setChannel(channelId, data);
    expect(
      JSON.parse(fakeLocalStorageAPI.getItem("channels") || "{}")[channelId]
    ).toEqual(data);
  });

  it("should throw an error if channel data has invalid format", () => {
    expect.assertions(1);
    try {
      // set data with invalid format
      storage.setChannel(channelId, {
        ...data,
        channel: { ...data.channel, id: "xxxx" },
      });
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual('validation error: key "id" must be UUIDv4');
    }
  });

  it("should throw an error if messages data has invalid format", () => {
    expect.assertions(1);
    try {
      // set data with invalid format
      storage.setChannel(channelId, {
        ...data,
        messages: [{ ...data.messages[0], id: "aaaa" }],
      });
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual('validation error: key "id" must be UUIDv4');
    }
  });
});
