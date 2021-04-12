import { v4 as uuid } from "uuid";
import { nanoid } from "nanoid";

import { UserService } from "./user.service";
import { User } from "../models/User.model";
import { CreateUserProps } from "../type";

// helper function
const getErrorMsg = () => `DATABSE ERROR: ${nanoid()}`;

describe("UserService", () => {
  describe("getUserById()", () => {
    it("should return user", async () => {
      expect.assertions(1);
      try {
        const id = uuid();
        User.findOne = jest.fn().mockReturnValue({ id });
        const user = await UserService.getUserById(id);
        expect(user).toEqual(null);
      } catch (e) {
        throw e;
      }
    });

    it("should return null", async () => {
      expect.assertions(1);
      try {
        const id = uuid();
        User.findOne = jest.fn().mockReturnValue(null);
        const user = await UserService.getUserById(id);
        expect(user).toEqual(null);
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
        await UserService.getUserById(id);
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
        const user = await UserService.getUserByUsername(username);
        expect(user?.username).toEqual(username);
      } catch (e) {
        throw e;
      }
    });
    it("should return null", async () => {
      expect.assertions(1);
      try {
        User.findOne = jest.fn().mockReturnValue(null);
        expect(await UserService.getUserByUsername(nanoid())).toEqual(null);
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
        await UserService.getUserByUsername(nanoid());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("createUser()", () => {
    it("should create a new user", async () => {
      expect.assertions(3);
      try {
        const user = {
          id: uuid(),
          username: nanoid(),
          displayName: nanoid(),
          firstName: nanoid(),
          lastName: nanoid(),
        } as CreateUserProps;
        User.findOne = jest.fn();
        User.create = jest.fn().mockReturnValue({ id: user.id });
        const createMock = User.create as jest.Mock;
        const newUser = await UserService.createUser({ ...user });
        expect(User.findOne).toHaveBeenCalledTimes(1);
        expect(createMock.mock.calls[0][0]).toEqual(user);
        expect(newUser?.id).toEqual(user.id);
      } catch (e) {
        throw e;
      }
    });

    it("should return null", async () => {
      expect.assertions(2);
      try {
        const user: CreateUserProps = {
          id: uuid(),
          username: nanoid(),
          displayName: nanoid(),
          firstName: nanoid(),
          lastName: nanoid(),
        };
        User.findOne = jest.fn().mockReturnValue(true);
        const newUser = await UserService.createUser({ ...user });
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
        await UserService.createUser({} as any);
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
        const result = await UserService.deleteUserById(nanoid());
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
        await UserService.deleteUserById(nanoid());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });
});
