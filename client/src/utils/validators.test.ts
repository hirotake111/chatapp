import { v4 as uuid } from "uuid";

import { UserInfoType } from "../reducers/userReducer";
import { validateUserInfo } from "./validators";

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
