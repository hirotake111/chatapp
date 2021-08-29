import { v4 as uuid } from "uuid";
import { nanoid } from "nanoid";
import { Op } from "sequelize";

import { getUserQuery, UserQuery } from "./userQuery";
import User from "../models/User.model";
import Channel from "../models/Channel.model";

let ChannelModel: typeof Channel;
let UserModel: typeof User;
let findOneChannelMock: jest.Mock;
let findOneUserMock: jest.Mock;
let findAllUserMock: jest.Mock;
let userQuery: UserQuery;

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

describe("userQuery", () => {
  beforeEach(() => {
    ChannelModel = {
      findOne: jest.fn(),
      findAll: jest.fn(),
    } as any;
    findOneChannelMock = ChannelModel.findOne as jest.Mock;
    UserModel = {
      findOne: jest.fn(),
      findAll: jest.fn().mockReturnValue([
        { id: "id1", username: "alice" },
        { id: "id2", usename: "bob" },
      ]),
    } as any;
    findAllUserMock = UserModel.findAll as jest.Mock;
    findOneUserMock = UserModel.findOne as jest.Mock;
    userQuery = getUserQuery({ UserModel, ChannelModel });
  });
  const otherUsers = [
    { id: "id1", username: "alice" },
    { id: "id2", usename: "bob" },
  ];

  describe("getUserById()", () => {
    it("should return user", async () => {
      expect.assertions(2);
      try {
        const id = uuid();
        UserModel.findOne = jest.fn().mockReturnValue({ id });
        findOneUserMock = UserModel.findOne as jest.Mock;
        const user = await userQuery.getUserById(id);
        expect(user).toEqual({ id });
        expect(findOneUserMock.mock.calls[0][0]).toEqual({ where: { id } });
      } catch (e) {
        throw e;
      }
    });

    it("should return null", async () => {
      expect.assertions(2);
      try {
        const id = uuid();
        UserModel.findOne = jest.fn().mockReturnValue(null);
        const findOneMock = UserModel.findOne as jest.Mock;
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
        UserModel.findOne = jest.fn().mockImplementation(() => {
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
        UserModel.findOne = jest.fn().mockReturnValue({ username });
        const user = await userQuery.getUserByUsername(username);
        expect(user?.username).toEqual(username);
      } catch (e) {
        throw e;
      }
    });
    it("should return null", async () => {
      expect.assertions(1);
      try {
        UserModel.findOne = jest.fn().mockReturnValue(null);
        expect(await userQuery.getUserByUsername(nanoid())).toEqual(null);
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error", async () => {
      expect.assertions(1);
      const msg = getErrorMsg();
      try {
        UserModel.findOne = jest.fn().mockImplementation(() => {
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
        UserModel.findOne = jest.fn();
        UserModel.create = jest.fn().mockReturnValue({ id: user.id });
        const createMock = UserModel.create as jest.Mock;
        const newUser = await userQuery.createUser({ ...user });
        expect(UserModel.findOne).toHaveBeenCalledTimes(1);
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
        UserModel.findOne = jest.fn().mockReturnValue(true);
        const newUser = await userQuery.createUser({ ...user });
        expect(UserModel.findOne).toHaveBeenCalledTimes(1);
        expect(newUser).toEqual(null);
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error", async () => {
      expect.assertions(1);
      const msg = getErrorMsg();
      try {
        UserModel.findOne = jest.fn();
        UserModel.create = jest.fn().mockImplementation(() => {
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
        UserModel.destroy = jest.fn().mockReturnValue(1);
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
        UserModel.destroy = jest.fn().mockImplementation(() => {
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
      try {
        const users = await userQuery.getOtherUsers(id);
        expect(users).toEqual(otherUsers);
        expect(findAllUserMock.mock.calls[0][0]).toEqual({
          where: { id: { [Op.ne]: id } },
          limit: 4,
        });
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error for any other errors", async () => {
      expect.assertions(1);
      const msg = "database error!";
      UserModel.findAll = jest.fn().mockImplementation(async () => {
        throw new Error(msg);
      });
      try {
        await userQuery.getOtherUsers(uuid());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("getUsersByChannelId", () => {
    it("should return User[]", async () => {
      expect.assertions(2);
      // add users directly to db
      const channelId = uuid();
      const requesterId = uuid();
      ChannelModel = {
        findOne: jest.fn().mockReturnValue({
          id: nanoid(),
          name: nanoid(),
          users: [
            {
              id: uuid(),
              username: "mockuser1",
            },
            {
              id: requesterId,
              username: nanoid(),
            },
          ],
        }),
      } as any;
      findOneChannelMock = ChannelModel.findOne as jest.Mock;
      userQuery = getUserQuery({ UserModel, ChannelModel });
      try {
        // get users
        const users = await userQuery.getUsersByChannelId(channelId);
        expect(users.length).toEqual(2);
        expect(findOneChannelMock.mock.calls[0][0].where).toEqual({
          id: channelId,
        });
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error if input is invalid", async () => {
      expect.assertions(1);
      try {
        await userQuery.getUsersByChannelId(nanoid());
      } catch (e) {
        expect(e.message).toEqual("invalid input");
      }
    });

    it("should raise an error if channel doesn't exist", async () => {
      expect.assertions(1);
      const channelId = uuid();
      ChannelModel.findOne = jest.fn().mockReturnValue(null);
      try {
        await userQuery.getUsersByChannelId(channelId);
      } catch (e) {
        expect(e.message).toEqual(`channel ID ${channelId} doesn't exist`);
      }
    });

    it("should raise an error for any other reason", async () => {
      expect.assertions(1);
      const msg = "db error";
      ChannelModel.findOne = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      userQuery = getUserQuery({ UserModel, ChannelModel });
      try {
        await userQuery.getUsersByChannelId(uuid());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });
});
