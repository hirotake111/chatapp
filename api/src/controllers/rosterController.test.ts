import { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";
import { v4 as uuid } from "uuid";

import { RosterQuery } from "../queries/rosterQeury";
import { UserQuery } from "../queries/userQuery";
import { getRosterContoller, RosterController } from "./rosterController";

let rosterController: RosterController;
let req: Request;
let res: Response;
let next: NextFunction;
let statusMock: jest.Mock;
let sendMock: jest.Mock;
let rosterQuery: RosterQuery;
let userQuery: UserQuery;

describe("rosterController", () => {
  describe("addChannelMember", () => {
    let channelId: string;
    let userId: string;
    let userIds: string[];
    let requesterId: string;

    beforeEach(() => {
      userId = uuid();
      userIds = [userId, uuid(), uuid(), uuid()];
      channelId = uuid();
      requesterId = uuid();
      req = {
        session: { userId: requesterId },
        body: { userIds },
        params: { channelId },
      } as any;
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
      next = {} as any;
      sendMock = res.send as jest.Mock;
      statusMock = res.status as jest.Mock;
      rosterQuery = {
        addUserToChannel: jest.fn().mockReturnValue({ channelId, userId }),
        deleteUserFromChannel: jest.fn(),
      };
      userQuery = {
        getUserByUsername: jest.fn(),
        getOtherUsers: jest.fn(),
        getUserById: jest.fn(),
        getUsersByChannelId: jest.fn().mockReturnValue([{ id: requesterId }]),
        createUser: jest.fn(),
        deleteUserById: jest.fn(),
      };
      rosterController = getRosterContoller({ rosterQuery, userQuery });
    });

    it("should add members", async () => {
      expect.assertions(2);
      try {
        await rosterController.addChannelMember(req, res, next);
        expect(sendMock.mock.calls[0][0]).toEqual({
          detail: "success",
          channelId,
          userIds,
        });
        expect(statusMock.mock.calls[0][0]).toEqual(200);
      } catch (e) {
        throw e;
      }
    });

    it("should validate channel ID", async () => {
      expect.assertions(2);
      req.params.channelId = nanoid();
      try {
        await rosterController.addChannelMember(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual("invalid channel ID");
      } catch (e) {
        throw e;
      }
    });

    it("should validate user IDs(array)", async () => {
      expect.assertions(2);
      req.body.userIds = uuid();
      try {
        await rosterController.addChannelMember(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual("invalid user IDs");
      } catch (e) {
        throw e;
      }
    });

    it("should validate user IDs(all elements are string)", async () => {
      expect.assertions(2);
      req.body.userIds = [uuid(), uuid(), uuid(), 100];
      try {
        await rosterController.addChannelMember(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual("invalid user IDs");
      } catch (e) {
        throw e;
      }
    });

    it("should validate user IDs(uuidv4)", async () => {
      expect.assertions(2);
      req.body.userIds = [nanoid()];
      try {
        await rosterController.addChannelMember(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual("invalid user IDs");
      } catch (e) {
        throw e;
      }
    });

    it("should validate requester ID", async () => {
      expect.assertions(2);
      req.session.userId = nanoid();
      try {
        await rosterController.addChannelMember(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "invalid requester ID"
        );
      } catch (e) {
        throw e;
      }
    });

    it("should check if requester is a member of channel", async () => {
      expect.assertions(2);
      req.session.userId = uuid();
      try {
        await rosterController.addChannelMember(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "you are not a member of the channel"
        );
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error for any other errors", async () => {
      expect.assertions(2);
      const msg = "database error!";
      rosterQuery.addUserToChannel = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await rosterController.addChannelMember(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
        expect(sendMock.mock.calls[0][0].detail).toEqual(msg);
      } catch (e) {
        throw e;
      }
    });
  });

  describe("removeChannelMember", () => {
    let channelId: string;
    let userId: string;
    let userIds: string[];
    let requesterId: string;

    beforeEach(() => {
      userId = uuid();
      userIds = [userId, uuid(), uuid(), uuid()];
      channelId = uuid();
      requesterId = uuid();
      req = {
        session: { userId: requesterId },
        body: { userIds },
        params: { channelId },
      } as any;
      res = { status: jest.fn().mockReturnThis(), send: jest.fn() } as any;
      next = {} as any;
      sendMock = res.send as jest.Mock;
      statusMock = res.status as jest.Mock;
      rosterQuery = {
        addUserToChannel: jest.fn().mockReturnValue({ channelId, userId }),
        deleteUserFromChannel: jest.fn(),
      };
      userQuery = {
        getUserByUsername: jest.fn(),
        getOtherUsers: jest.fn(),
        getUserById: jest.fn(),
        getUsersByChannelId: jest.fn().mockReturnValue([{ id: requesterId }]),
        createUser: jest.fn(),
        deleteUserById: jest.fn(),
      };
      rosterController = getRosterContoller({ rosterQuery, userQuery });
    });

    it("should remove members from channel", async () => {
      expect.assertions(2);
      rosterQuery.deleteUserFromChannel = jest.fn().mockReturnValue(1);
      try {
        await rosterController.removeChannelMember(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(200);
        expect(sendMock.mock.calls[0][0].detail).toEqual("success");
      } catch (e) {
        throw e;
      }
    });

    it("should validate channel ID", async () => {
      expect.assertions(2);
      req.params.channelId = nanoid();
      try {
        await rosterController.removeChannelMember(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual("invalid channel ID");
      } catch (e) {
        throw e;
      }
    });

    it("should validate requester ID", async () => {
      expect.assertions(2);
      req.session.userId = nanoid();
      try {
        await rosterController.removeChannelMember(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "invalid requester ID"
        );
      } catch (e) {
        throw e;
      }
    });

    it("should check if requester is a member of channel", async () => {
      expect.assertions(2);
      req.session.userId = uuid();
      try {
        await rosterController.removeChannelMember(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "you are not a member of the channel"
        );
      } catch (e) {
        throw e;
      }
    });

    it("should validate user IDs(uuidv4)", async () => {
      expect.assertions(2);
      req.body.userIds = [nanoid()];
      try {
        await rosterController.removeChannelMember(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual("invalid user IDs");
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error for any other errors", async () => {
      expect.assertions(2);
      const msg = "database error!";
      rosterQuery.deleteUserFromChannel = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await rosterController.removeChannelMember(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
        expect(sendMock.mock.calls[0][0].detail).toEqual(msg);
      } catch (e) {
        throw e;
      }
    });
  });
});
