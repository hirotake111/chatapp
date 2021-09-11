import { nanoid } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

import { TypeToBeValidated, validateData } from "./validators";

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
