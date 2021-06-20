import { v4 as uuid } from "uuid";
import { nanoid } from "nanoid";
import { Op } from "sequelize";

import { getUserQuery } from "./userQuery";
import User from "../models/User.model";

// user service
const userQuery = getUserQuery({ UserModel: User });

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
        const user = await userQuery.getUserById(id);
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
        const user = await userQuery.getUserById(id);
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
        await userQuery.getUserById(id);
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
        const user = await userQuery.getUserByUsername(username);
        expect(user?.username).toEqual(username);
      } catch (e) {
        throw e;
      }
    });
    it("should return null", async () => {
      expect.assertions(1);
      try {
        User.findOne = jest.fn().mockReturnValue(null);
        expect(await userQuery.getUserByUsername(nanoid())).toEqual(null);
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
        await userQuery.getUserByUsername(nanoid());
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
        const newUser = await userQuery.createUser({ ...user });
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
        const newUser = await userQuery.createUser({ ...user });
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
        await userQuery.createUser({} as any);
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
        const result = await userQuery.deleteUserById(nanoid());
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
        await userQuery.deleteUserById(nanoid());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("getOtherUsers", () => {
    it("should return an array of users except the user itself", async () => {
      expect.assertions(2);
      const id = uuid();
      const otherUsers = [
        { id: "id1", username: "alice" },
        { id: "id2", usename: "bob" },
      ];
      // User.findAll should return a list of other users
      User.findAll = jest.fn().mockReturnValue(otherUsers);
      const findAllMock = User.findAll as jest.Mock;
      try {
        const users = await userQuery.getOtherUsers(id);
        expect(users).toEqual(otherUsers);
        expect(findAllMock.mock.calls[0][0]).toEqual({
          where: { id: { [Op.ne]: id } },
        });
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error for any other errors", async () => {
      expect.assertions(1);
      const msg = "database error!";
      User.findAll = jest.fn().mockImplementation(async () => {
        throw new Error(msg);
      });
      try {
        await userQuery.getOtherUsers(uuid());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });
});
