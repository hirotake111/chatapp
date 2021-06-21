import { Request, NextFunction, Response } from "express";
import { nanoid } from "nanoid";
import { v4 as uuid } from "uuid";
import User from "../models/User.model";
import { ChannelQuery } from "../queries/channelQuery";
import { RosterQuery } from "../queries/rosterQeury";
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
  beforeEach(() => {
    req = {
      body: { channelId: uuid(), channelName: nanoid() },
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

  describe("postChannel", () => {
    it("should create channel and respond 200", async () => {
      expect.assertions(2);
      try {
        await controller.postChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(200);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "channel is successfully created"
        );
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 500", async () => {
      expect.assertions(12);
      try {
        // no HTTP body
        await controller.postChannel({} as any, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "HTTP request has no body"
        );
        // invalid HTTP body (no channelName)
        await controller.postChannel(
          {
            body: { channelId: uuid() },
            session: { userId: uuid() },
          } as any,
          res,
          next
        );
        expect(statusMock.mock.calls[1][0]).toEqual(500);
        expect(sendMock.mock.calls[1][0].detail).toEqual("invalid HTTP body");
        // invalid HTTP body (no channelId)
        await controller.postChannel(
          {
            body: { channelId: uuid() },
            session: { userId: uuid() },
          } as any,
          res,
          next
        );
        expect(statusMock.mock.calls[2][0]).toEqual(500);
        expect(sendMock.mock.calls[2][0].detail).toEqual("invalid HTTP body");
        // invalid HTTP body (no userId)
        await controller.postChannel(
          {
            body: { channelId: uuid(), channelName: nanoid() },
            session: {},
          } as any,
          res,
          next
        );
        expect(statusMock.mock.calls[3][0]).toEqual(500);
        expect(sendMock.mock.calls[3][0].detail).toEqual("invalid HTTP body");
        // invalid HTTP body (invalid channelId)
        await controller.postChannel(
          {
            body: { channelId: nanoid(), channelName: nanoid() },
            session: { userId: uuid() },
          } as any,
          res,
          next
        );
        expect(statusMock.mock.calls[4][0]).toEqual(500);
        expect(sendMock.mock.calls[4][0].detail).toEqual(
          `either channelId or channelName has invalid type`
        );
        // invalid HTTP body (invalid channelName)
        await controller.postChannel(
          {
            body: { channelId: uuid(), channelName: 123 },
            session: { userId: uuid() },
          } as any,
          res,
          next
        );
        expect(statusMock.mock.calls[4][0]).toEqual(500);
        expect(sendMock.mock.calls[4][0].detail).toEqual(
          `either channelId or channelName has invalid type`
        );
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 400 if channel already exists", async () => {
      expect.assertions(2);
      channelQuery.createChannel = jest.fn().mockReturnValue(null);
      try {
        await controller.postChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "channel already exists"
        );
      } catch (e) {
        throw e;
      }
    });
  });

  describe("getChannel", () => {
    it("should return user info and channels", async () => {
      expect.assertions(2);
      try {
        await controller.getChannel(req, res, next);
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
        await controller.getChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
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
