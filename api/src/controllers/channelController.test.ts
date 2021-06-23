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
  let channelName: string;
  let requesterId: string;
  let users: any[];

  beforeEach(() => {
    channelId = uuid();
    channelName = nanoid();
    requesterId = uuid();
    users = [{ id: requesterId }, { id: uuid() }];
    req = {
      params: { channelId },
      body: { channelId, channelName },
      session: { userId: requesterId },
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
      getChannelById: jest
        .fn()
        .mockReturnValue({ id: channelId, name: channelName }),
      getChannelsByUserId: jest
        .fn()
        .mockReturnValue([{ id: uuid(), name: nanoid() }]),
      updateChannelbyId: jest
        .fn()
        .mockReturnValue({ id: channelId, name: req.body.channelName }),
      deleteChannelById: jest.fn().mockReturnValue(1),
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
      getUsersByChannelId: jest.fn().mockReturnValue(users),
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

    it("should validate channel name", async () => {
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

    it("should respond HTTP 500 for any other errors", async () => {
      expect.assertions(2);
      const msg = nanoid();
      channelQuery.createChannel = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await controller.createNewChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
        expect(sendMock.mock.calls[0][0].detail).toEqual(msg);
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

    it("should validate requester ID", async () => {
      expect.assertions(2);
      try {
        req.session.userId = nanoid();
        await controller.getMyChannels(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "invalid requester ID"
        );
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
    it("should get channel ID and channel name", async () => {
      expect.assertions(2);
      try {
        await controller.getChannelDetail(req, res, next);
        expect(sendMock.mock.calls[0][0].channel.name).toEqual(channelName);
        expect(statusMock.mock.calls[0][0]).toEqual(200);
      } catch (e) {
        throw e;
      }
    });

    it("should validate if requester is not a member of it", async () => {
      expect.assertions(2);
      try {
        userQuery.getUsersByChannelId = jest
          .fn()
          .mockReturnValue([{ id: uuid() }]);
        await controller.getChannelDetail(req, res, next);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "requester is not a member of channel"
        );
        expect(statusMock.mock.calls[0][0]).toEqual(400);
      } catch (e) {
        throw e;
      }
    });

    it("should validate channelId", async () => {
      expect.assertions(2);
      try {
        req.params.channelId = nanoid();
        await controller.getChannelDetail(req, res, next);
        expect(sendMock.mock.calls[0][0].detail).toEqual("invalid channel ID");
        expect(statusMock.mock.calls[0][0]).toEqual(400);
      } catch (e) {
        throw e;
      }
    });

    it("should validate requesterId", async () => {
      expect.assertions(2);
      try {
        req.session.userId = nanoid();
        await controller.getChannelDetail(req, res, next);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          `invalid requester ID: ${req.session.userId}`
        );
        expect(statusMock.mock.calls[0][0]).toEqual(400);
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 400 if channel doesn't exist", async () => {
      expect.assertions(2);
      try {
        channelQuery.getChannelById = jest.fn().mockReturnValue(null);
        await controller.getChannelDetail(req, res, next);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "channel doesn't exist"
        );
        expect(statusMock.mock.calls[0][0]).toEqual(400);
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 500 for any other errors", async () => {
      expect.assertions(2);
      const msg = nanoid();
      try {
        userQuery.getUsersByChannelId = jest.fn().mockImplementation(() => {
          throw new Error(msg);
        });
        await controller.getChannelDetail(req, res, next);
        expect(sendMock.mock.calls[0][0].detail).toEqual(msg);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
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
      expect.assertions(1);
      try {
        await controller.deleteChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(204);
      } catch (e) {
        throw e;
      }
    });

    it("should validate channelId", async () => {
      expect.assertions(2);
      req.params.channelId = nanoid();
      try {
        await controller.deleteChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual("invalid channel ID");
      } catch (e) {
        throw e;
      }
    });

    it("should validate requesterId", async () => {
      expect.assertions(2);
      req.session.userId = nanoid();
      try {
        await controller.deleteChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "invalid requester ID"
        );
      } catch (e) {
        throw e;
      }
    });

    it("should validate if requester is not a member of it", async () => {
      expect.assertions(2);
      userQuery.getUsersByChannelId = jest.fn().mockReturnValue([]);
      try {
        await controller.deleteChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "requester is not a member of channel"
        );
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 500 for any other errors", async () => {
      expect.assertions(2);
      const msg = "db error!!!";
      userQuery.getUsersByChannelId = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await controller.deleteChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
        expect(sendMock.mock.calls[0][0].detail).toEqual(msg);
      } catch (e) {
        throw e;
      }
    });
  });

  describe("getChannelMembers", () => {
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

    it("should validate channelId", async () => {
      expect.assertions(2);
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
    });

    it("should validate requesterId", async () => {
      expect.assertions(2);
      // invalid user ID
      req.session.userId = nanoid();
      try {
        await controller.getChannelMembers(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          `invalid requester ID: ${req.session.userId}`
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

  describe("updateChannel", () => {
    it("should update existing channel", async () => {
      expect.assertions(2);
      req.body.channelName = nanoid();
      try {
        await controller.updateChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(200);
        expect(sendMock.mock.calls[0][0].name).toEqual(req.body.channelName);
      } catch (e) {
        throw e;
      }
    });

    it("should validate channelId", async () => {
      expect.assertions(2);
      req.params.channelId = nanoid();
      try {
        await controller.updateChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual("invalid channel ID");
      } catch (e) {
        throw e;
      }
    });

    it("should validate requesterId", async () => {
      expect.assertions(2);
      req.session.userId = nanoid();
      try {
        await controller.updateChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "invalid requester ID"
        );
      } catch (e) {
        throw e;
      }
    });

    it("should validate channelName", async () => {
      expect.assertions(2);
      req.body.channelName = 123;
      try {
        await controller.updateChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "invalid channel name"
        );
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 400 if it gets null from query", async () => {
      expect.assertions(2);
      channelQuery.updateChannelbyId = jest.fn().mockReturnValue(null);
      try {
        await controller.updateChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "unable to update channel with given parameters"
        );
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 500 for any other errors", async () => {
      expect.assertions(2);
      const msg = "db errorrrr";
      channelQuery.updateChannelbyId = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await controller.updateChannel(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
        expect(sendMock.mock.calls[0][0].detail).toEqual(msg);
      } catch (e) {
        throw e;
      }
    });
  });
});
