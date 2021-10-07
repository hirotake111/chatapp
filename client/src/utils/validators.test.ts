import { nanoid } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import { getFakeChannel, getFakeMessage, getFakeUser } from "./testHelpers";

import {
  TypeToBeValidated,
  validateData,
  validateSearchSuggestionUser,
  validateChannel,
  validateChannelsPayload,
  validateMessage,
  validateMessages,
} from "./validators";

describe("validateData", () => {
  it("should validate data", () => {
    expect.assertions(5);
    const customType: TypeToBeValidated = {
      name: { type: "string" },
      age: { type: "number" },
    };
    const data = { name: nanoid(), age: 44 };
    expect(validateData(data, customType)).toEqual(data);
    // key is not in object
    try {
      validateData({ age: 12 }, customType);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          "validation error: data doesn't contain name"
        );
    }
    try {
      validateData({ name: nanoid() }, customType);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual("validation error: data doesn't contain age");
    }
    // invalid key type
    try {
      validateData({ name: nanoid(), age: nanoid() }, customType);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          'validation error: key "age" should be of type "number" but "string"'
        );
    }
    try {
      validateData({ name: false, age: 30 }, customType);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          'validation error: key "name" should be of type "string" but "boolean"'
        );
    }
  });

  it("should validate nested data", () => {
    expect.assertions(2);
    const customType: TypeToBeValidated = {
      age: { type: "number" },
      name: {
        type: "parent",
        child: {
          firstName: { type: "string" },
          lastName: { type: "string" },
        },
      },
    };
    const data = { age: 13, name: { firstName: nanoid(), lastName: nanoid() } };
    expect(validateData(data, customType)).toEqual(data);
    // invalid data
    try {
      validateData(
        { age: 13, name: { firstName: nanoid(), lastName: 123 } },
        customType
      );
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          'validation error: key "lastName" should be of type "string" but "number"'
        );
    }
  });

  it("should validate array", () => {
    expect.assertions(4);
    const customType: TypeToBeValidated = {
      age: { type: "number" },
      name: { type: "string", isArray: true },
    };
    const data = { age: 11, name: [nanoid(), nanoid()] };
    expect(validateData(data, customType)).toEqual(data);
    // value supposed to be of type array but not
    try {
      validateData({ age: 11, name: nanoid() }, customType);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          'validation error: key "name" should be an array of "string" but not an array'
        );
    }
    // one element is wrong type
    try {
      validateData({ age: 11, name: [1, 2, 3, 4] }, customType);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          'validation error: element of "name" should be of type "string" but "number"'
        );
    }
    try {
      validateData({ age: 11, name: ["1", "2", "3", 4] }, customType);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          'validation error: element of "name" should be of type "string" but "number"'
        );
    }
  });

  it("should validate UUID", () => {
    expect.assertions(2);
    const customType: TypeToBeValidated = {
      age: { type: "number" },
      id: { type: "string", isUUID: true },
    };
    const data = { age: 11, id: uuid() };
    expect(validateData(data, customType)).toEqual(data);
    try {
      validateData({ age: 11, id: nanoid() }, customType);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual('validation error: key "id" must be UUIDv4');
    }
  });

  it("should validate array of object", () => {
    expect.assertions(2);
    const customType: TypeToBeValidated = {
      age: { type: "number" },
      users: {
        type: "parent",
        isArray: true,
        child: {
          name: { type: "string" },
          id: { type: "string", isUUID: true },
        },
      },
    };
    const data = {
      age: 11,
      users: [
        { name: nanoid(), id: uuid() },
        { name: nanoid(), id: uuid() },
      ],
    };
    expect(validateData(data, customType)).toEqual(data);
    try {
      validateData(
        {
          age: 11,
          users: [
            { name: nanoid(), id: uuid() },
            { name: nanoid(), id: nanoid() },
          ],
        },
        customType
      );
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual('validation error: key "id" must be UUIDv4');
    }
  });
});

describe("validateChannel", () => {
  it("should return data if passed data is valid", () => {
    expect.assertions(1);
    const channel = getFakeChannel();
    expect(validateChannel(channel)).toEqual(channel);
  });

  it("should throw an error if passed data is invalid", () => {
    expect.assertions(1);
    try {
      validateChannel({});
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual("validation error: data doesn't contain id");
    }
  });
});

describe("validateMessage", () => {
  it("should return data if passed data is valid one", () => {
    expect.assertions(1);
    const message = getFakeMessage();
    expect(validateMessage(message)).toEqual(message);
  });

  it("should throw an error if passed data is invalid", () => {
    expect.assertions(1);
    try {
      validateMessage(false);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual("validation error: data doesn't contain id");
    }
  });
});

describe("validateMessages", () => {
  it("should return data if passed data is valid one", () => {
    expect.assertions(1);
    const data = [getFakeMessage(), getFakeMessage(), getFakeMessage()];
    expect(validateMessages(data)).toEqual(data);
  });

  it("should throw an error if it's not an array", () => {
    expect.assertions(1);
    try {
      validateMessages(false);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          "validateMessages: data is not an array - false"
        );
    }
  });

  it("should throw an error if either of messages is invalid", () => {
    expect.assertions(1);
    try {
      const data = [
        getFakeMessage(),
        getFakeMessage(),
        { id: "abcdefg" },
        getFakeMessage(),
      ];
      validateMessages(data);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual('validation error: key "id" must be UUIDv4');
    }
  });
});

describe("validateChannelsPayload", () => {
  it("should return data if passed data is valid one", () => {
    expect.assertions(1);
    const channels = [getFakeChannel(), getFakeChannel(), getFakeChannel()];
    expect(validateChannelsPayload(channels)).toEqual(channels);
  });

  it("should throw an error if it's not an array", () => {
    expect.assertions(1);
    try {
      validateChannelsPayload(false);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          "validateChannelsPayload: invalid data.channels prop"
        );
    }
  });
});

describe("validateSearchSuggestionUser", () => {
  it("should return data if passed data is valid one", () => {
    expect.assertions(1);
    const user = getFakeUser();
    expect(validateSearchSuggestionUser(user)).toEqual(user);
  });

  it("should throw an error if passed data is invalid", () => {
    expect.assertions(1);
    try {
      validateSearchSuggestionUser(false);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual("validation error: data doesn't contain id");
    }
  });
});
