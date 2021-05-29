import { v4 as uuid } from "uuid";
import { nanoid } from "nanoid";

import { getUserService } from "./user.service";
import User from "../models/User.model";
import { CreateUserProps } from "../type";

// user service
const userService = getUserService(User);

// helper function
const getErrorMsg = () => `DATABSE ERROR: ${nanoid()}`;

/** helper function to get user object */
const getUser = (): CreateUserProps => ({
  id: uuid(),
  username: nanoid(),
  displayName: nanoid(),
  firstName: nanoid(),
  lastName: nanoid(),
});

describe("UserService", () => {
  describe("getUserById()", () => {
    it("should return user", async () => {
      expect.assertions(2);
      try {
        const id = uuid();
        User.findOne = jest.fn().mockReturnValue({ id });
        const findOneMock = User.findOne as jest.Mock;
        const user = await userService.getUserById(id);
        expect(user).toEqual({ id });
        expect(findOneMock.mock.calls[0][0]).toEqual({ where: { id } });
      } catch (e) {
        throw e;
      }
    });

    it("should return null", async () => {
      expect.assertions(2);
      try {
        const id = uuid();
        User.findOne = jest.fn().mockReturnValue(null);
        const findOneMock = User.findOne as jest.Mock;
        const user = await userService.getUserById(id);
        expect(user).toEqual(null);
        expect(findOneMock.mock.calls[0][0]).toEqual({ where: { id } });
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error", async () => {
      expect.assertions(1);
      const msg = getErrorMsg();
      try {
        const id = uuid();
        User.findOne = jest.fn().mockImplementation(() => {
          throw new Error(msg);
        });
        await userService.getUserById(id);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("getUserByUsername()", () => {
    it("should return a user", async () => {
      expect.assertions(1);
      try {
        const username = nanoid();
        User.findOne = jest.fn().mockReturnValue({ username });
        const user = await userService.getUserByUsername(username);
        expect(user?.username).toEqual(username);
      } catch (e) {
        throw e;
      }
    });
    it("should return null", async () => {
      expect.assertions(1);
      try {
        User.findOne = jest.fn().mockReturnValue(null);
        expect(await userService.getUserByUsername(nanoid())).toEqual(null);
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error", async () => {
      expect.assertions(1);
      const msg = getErrorMsg();
      try {
        User.findOne = jest.fn().mockImplementation(() => {
          throw new Error(msg);
        });
        await userService.getUserByUsername(nanoid());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("createUser()", () => {
    it("should create a new user", async () => {
      expect.assertions(6);
      try {
        const user = getUser();
        User.findOne = jest.fn();
        User.create = jest.fn().mockReturnValue({ id: user.id });
        const createMock = User.create as jest.Mock;
        const newUser = await userService.createUser({ ...user });
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(createMock.mock.calls[0][0].username).toEqual(user.username);
        expect(createMock.mock.calls[0][0].displayName).toEqual(
          user.displayName
        );
        expect(createMock.mock.calls[0][0].firstName).toEqual(user.firstName);
        expect(createMock.mock.calls[0][0].lastName).toEqual(user.lastName);
        expect(newUser?.id).toEqual(user.id);
      } catch (e) {
        throw e;
      }
    });

    it("should return null", async () => {
      expect.assertions(2);
      try {
        const user = getUser();
        User.findOne = jest.fn().mockReturnValue(true);
        const newUser = await userService.createUser({ ...user });
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(newUser).toEqual(null);
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error", async () => {
      expect.assertions(1);
      const msg = getErrorMsg();
      try {
        User.findOne = jest.fn();
        User.create = jest.fn().mockImplementation(() => {
          throw new Error(msg);
        });
        await userService.createUser({} as any);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("deleteUserById()", () => {
    it("should delete a user", async () => {
      expect.assertions(1);
      try {
        User.destroy = jest.fn().mockReturnValue(1);
        const result = await userService.deleteUserById(nanoid());
        expect(result).toEqual(1);
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error", async () => {
      expect.assertions(1);
      const msg = getErrorMsg();
      try {
        User.destroy = jest.fn().mockImplementation(() => {
          throw new Error(msg);
        });
        await userService.deleteUserById(nanoid());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });
});
