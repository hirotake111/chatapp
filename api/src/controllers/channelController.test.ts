import { Request, NextFunction, Response } from "express";
import { nanoid } from "nanoid";
import { v4 as uuid } from "uuid";
import User from "../models/User.model";
import { ChannelQuery } from "../queries/channelQuery";
import { RosterQuery } from "../queries/rosterQuery";
import { UserQuery } from "../queries/userQuery";
import { ChannelController, getChannelController } from "./channelController";

let controller: ChannelController;
let channelQuery: ChannelQuery;
let rosterQuery: RosterQuery;
let userQuery: UserQuery;
let req: Request;
let res: Response;
let next: NextFunction;
let statusMock: jest.Mock;
let sendMock: jest.Mock;

describe("channelController", () => {
  let channelId: string;
  beforeEach(() => {
    channelId = uuid();
    req = {
      params: { channelId },
      body: { channelId, channelName: nanoid() },
      session: { userId: uuid() },
    } as any;
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;
    next = {} as any;
    statusMock = res.status as jest.Mock;
    sendMock = res.send as jest.Mock;
    channelQuery = {
      createChannel: jest
        .fn()
        .mockReturnValue({ id: uuid(), createdAt: Date.now() }),
      getChannelById: jest.fn(),
      getChannelsByUserId: jest
        .fn()
        .mockReturnValue([{ id: uuid(), name: nanoid() }]),
      updateChannelbyId: jest.fn(),
      deleteChannelById: jest.fn(),
    };
    rosterQuery = {
      addUserToChannel: jest.fn().mockReturnValue({ joinedAt: Date.now() }),
      deleteUserFromChannel: jest.fn(),
    };
    userQuery = {
      getUserById: jest.fn(),
      createUser: jest.fn(),
      getOtherUsers: jest.fn(),
      getUserByUsername: jest.fn(),
      deleteUserById: jest.fn(),
      getUsersByChannelId: jest.fn(),
    };
    controller = getChannelController({ channelQuery, rosterQuery, userQuery });
  });

  describe("createNewChannel", () => {
    it("should create channel and respond 200", async () => {
      expect.assertions(2);
      try {
        await controller.createNewChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(200);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "channel is successfully created"
        );
      } catch (e) {
        throw e;
      }
    });

    it("should validate HTTP body", async () => {
      expect.assertions(2);
      try {
        // no HTTP body
        await controller.createNewChannel({} as any, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "HTTP request has no body"
        );
      } catch (e) {
        throw e;
      }
    });

    it("should validate chanel name", async () => {
      expect.assertions(2);
      try {
        // invalid channel name
        req.body.channelName = 123;
        await controller.createNewChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "invalid channel name"
        );
      } catch (e) {
        throw e;
      }
    });

    it("should validate chanel ID", async () => {
      expect.assertions(2);
      try {
        // invalid channel ID
        req.body.channelId = nanoid();
        await controller.createNewChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual("invalid channel ID");
      } catch (e) {
        throw e;
      }
    });

    it("should validate chanel ID (params and body)", async () => {
      expect.assertions(2);
      try {
        // invalid channel ID
        req.body.channelId = uuid();
        await controller.createNewChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual("invalid channel ID");
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 400 if channel already exists", async () => {
      expect.assertions(2);
      channelQuery.createChannel = jest.fn().mockReturnValue(null);
      try {
        await controller.createNewChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "channel already exists"
        );
      } catch (e) {
        throw e;
      }
    });
  });

  describe("getMyChannels", () => {
    it("should return user info and channels", async () => {
      expect.assertions(2);
      try {
        await controller.getMyChannels(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(200);
        expect(sendMock.mock.calls[0][0].detail).toEqual("success");
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 500 for any other errors", async () => {
      expect.assertions(1);
      const msg = "database error";
      channelQuery.getChannelsByUserId = (params: any) => {
        throw new Error(msg);
      };
      try {
        await controller.getMyChannels(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
      } catch (e) {
        throw e;
      }
    });
  });

  describe("getChannelDetail", () => {
    it("should get channel Id and channel name", async () => {
      // expect.assertions(2);
      try {
      } catch (e) {
        throw e;
      }
    });

    it("should validate if requester is not a member of it", async () => {
      // expect.assertions(2);
      try {
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 500 for any other errors", async () => {
      // expect.assertions(2);
      try {
      } catch (e) {
        throw e;
      }
    });
  });

  describe("updateChannel", () => {
    it("should update channel name", async () => {
      // expect.assertions(2);
      try {
      } catch (e) {
        throw e;
      }
    });

    it("should create channel if not exist", async () => {
      // expect.assertions(2);
      try {
      } catch (e) {
        throw e;
      }
    });

    it("should validate if requester is not a member of it", async () => {
      // expect.assertions(2);
      try {
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 500 for any other errors", async () => {
      // expect.assertions(2);
      try {
      } catch (e) {
        throw e;
      }
    });
  });

  describe("deleteChannel", () => {
    it("should delete existing channel", async () => {
      // expect.assertions(2);
      try {
      } catch (e) {
        throw e;
      }
    });

    it("should validate if requester is not a member of it", async () => {
      // expect.assertions(2);
      try {
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 500 for any other errors", async () => {
      // expect.assertions(2);
      try {
      } catch (e) {
        throw e;
      }
    });
  });

  describe("getChannelMembers", () => {
    let users: User[];
    beforeEach(() => {
      req = {
        params: { channelId: uuid() },
        session: { userId: uuid() },
      } as any;
      // mock that returns an array of users
      users = [{ userId: uuid() }, { userId: uuid() }] as any[];
      userQuery.getUsersByChannelId = jest.fn().mockReturnValue(users);
    });

    it("should respond members of a channel", async () => {
      expect.assertions(2);
      try {
        await controller.getChannelMembers(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(200);
        expect(sendMock.mock.calls[0][0].members).toEqual(users);
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 400 if input is invalid", async () => {
      expect.assertions(4);
      // invalid channelId
      const channelId = nanoid();
      req.params.channelId = channelId;
      try {
        await controller.getChannelMembers(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          `invalid channel ID: ${channelId}`
        );
      } catch (e) {
        throw e;
      }
      // invalid user ID
      req.params.channelId = uuid();
      const userId = nanoid();
      req.session.userId = userId;
      try {
        await controller.getChannelMembers(req, res, next);
        expect(statusMock.mock.calls[1][0]).toEqual(400);
        expect(sendMock.mock.calls[1][0].detail).toEqual(
          `invalid user ID: ${userId}`
        );
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error for any other reasons", async () => {
      expect.assertions(2);
      const msg = "db err";
      // this always throw an error
      userQuery.getUsersByChannelId = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await controller.getChannelMembers(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
        expect(sendMock.mock.calls[0][0].detail).toEqual(msg);
      } catch (e) {
        throw e;
      }
    });
  });
});
