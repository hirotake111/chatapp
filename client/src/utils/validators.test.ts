import { nanoid } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

import { UserInfoType } from "../reducers/userReducer";
import {
  TypeToBeValidated,
  validateData,
  validateUserInfo,
} from "./validators";

const getUserInfo = (): UserInfoType => ({
  userId: uuid(),
  username: "qwerty1234",
  displayName: "QWERTY4321",
  firstName: "Qwerty",
  lastName: "12345",
});

describe("validateUserInfo", () => {
  it("should validate data", () => {
    expect.assertions(1);
    const data = getUserInfo();
    expect(validateUserInfo(data)).toEqual(data);
  });

  it("should throw error if data is invalid", () => {
    expect.assertions(6);
    // userId is not UUID
    try {
      validateUserInfo({ ...getUserInfo(), userId: "xx" });
    } catch (e) {
      if (e instanceof Error) expect(e.message).toEqual("Invalid userId");
    }
    // userId is not string
    try {
      validateUserInfo({ ...getUserInfo(), userId: 123 });
    } catch (e) {
      if (e instanceof Error) expect(e.message).toEqual("Invalid userId");
    }
    // useranme is not string
    try {
      validateUserInfo({ ...getUserInfo(), username: 123 });
    } catch (e) {
      if (e instanceof Error) expect(e.message).toEqual("Invalid username");
    }
    // displayName is not string
    try {
      validateUserInfo({ ...getUserInfo(), displayName: 123 });
    } catch (e) {
      if (e instanceof Error) expect(e.message).toEqual("Invalid displayName");
    }
    // firstName is not string
    try {
      validateUserInfo({ ...getUserInfo(), firstName: 123 });
    } catch (e) {
      if (e instanceof Error) expect(e.message).toEqual("Invalid firstName");
    }
    // lastName is not string
    try {
      validateUserInfo({ ...getUserInfo(), lastName: 123 });
    } catch (e) {
      if (e instanceof Error) expect(e.message).toEqual("Invalid lastName");
    }
  });
});

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
        expect(e.message).toEqual("data doesn't contain name");
    }
    try {
      validateData({ name: nanoid() }, customType);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual("data doesn't contain age");
    }
    // invalid key type
    try {
      validateData({ name: nanoid(), age: nanoid() }, customType);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          'key "age" should be of type "number" but "string"'
        );
    }
    try {
      validateData({ name: false, age: 30 }, customType);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          'key "name" should be of type "string" but "boolean"'
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
          'key "lastName" should be of type "string" but "number"'
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
          'key "name" should be an array of "string" but not an array'
        );
    }
    // one element is wrong type
    try {
      validateData({ age: 11, name: [1, 2, 3, 4] }, customType);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          'element of "name" should be of type "string" but "number"'
        );
    }
    try {
      validateData({ age: 11, name: ["1", "2", "3", 4] }, customType);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          'element of "name" should be of type "string" but "number"'
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
        expect(e.message).toEqual('key "id" must be UUIDv4');
    }
  });
});
