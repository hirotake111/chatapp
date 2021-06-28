import { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";
import { v4 as uuid } from "uuid";
import { MessageQuery } from "../queries/messageQuery";
import { UserQuery } from "../queries/userQuery";

import { getMessageController, MessageController } from "./messageController";

describe("messageController", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;
  let messageQuery: MessageQuery;
  let userQuery: UserQuery;
  let controller: MessageController;
  let requesterId: string;
  let channelId: string;
  let message: {
    id: string;
    channelId: string;
    content: string;
    sender: {
      id: string;
    };
  };
  let messages: any[];

  beforeEach(() => {
    requesterId = uuid();
    channelId = uuid();
    req = {
      session: { userId: requesterId },
      params: { channelId },
      body: { content: nanoid() },
    } as any;
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as any;
    next = {} as any;
    mockStatus = res.status as jest.Mock;
    mockSend = res.send as jest.Mock;
    message = {
      id: uuid(),
      channelId,
      content: nanoid(),
      sender: {
        id: requesterId,
      },
    };
    messages = [
      message,
      { id: uuid(), channelId, content: nanoid(), sender: { id: uuid() } },
    ];
    messageQuery = {
      createMessage: jest.fn().mockReturnValue(message),
      getMessagesInChannel: jest.fn().mockReturnValue(messages),
      getSpecificMessage: jest.fn(),
      editMessage: jest.fn(),
      deleteMessage: jest.fn(),
    };
    userQuery = {
      getOtherUsers: jest.fn(),
      getUserById: jest.fn(),
      getUserByUsername: jest.fn(),
      getUsersByChannelId: jest
        .fn()
        .mockReturnValue([{ id: requesterId }, { id: uuid() }]),
      createUser: jest.fn(),
      deleteUserById: jest.fn(),
    };
    controller = getMessageController({ messageQuery, userQuery });
  });

  describe("postMessage", () => {
    it("should create a new message", async () => {
      expect.assertions(2);
      try {
        await controller.postMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(201);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "success",
          message,
        });
      } catch (e) {
        throw e;
      }
    });

    it("should validate requesterId", async () => {
      expect.assertions(2);
      req.session.userId = nanoid();
      try {
        await controller.postMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "invalid requester ID",
        });
      } catch (e) {
        throw e;
      }
    });
    it("should validate channelId", async () => {
      expect.assertions(2);
      req.params.channelId = nanoid();
      try {
        await controller.postMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: `invalid channel ID: ${req.params.channelId}`,
        });
      } catch (e) {
        throw e;
      }
    });
    it("should respond HTTP 400 if requester is not a member of channel", async () => {
      expect.assertions(2);
      userQuery.getUsersByChannelId = jest
        .fn()
        .mockReturnValue([{ id: uuid() }, { id: uuid() }]);
      try {
        await controller.postMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "requester is not a member of channel",
        });
      } catch (e) {
        throw e;
      }
    });
    it("should respond HTTP 400 if channel doesn't exist", async () => {
      expect.assertions(2);
      userQuery.getUsersByChannelId = (id: string) => {
        throw new Error(`channel ID ${id} doesn't exist`);
      };
      try {
        await controller.postMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: `channel ID ${req.params.channelId} doesn't exist`,
        });
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 400 if messageId already exists", async () => {
      expect.assertions(2);
      messageQuery.getSpecificMessage = jest
        .fn()
        .mockReturnValue({ id: uuid() });
      try {
        await controller.postMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "message ID already exists",
        });
      } catch (e) {
        throw e;
      }
    });
    it("should respond HTTP 500 for any other errors", async () => {
      expect.assertions(2);
      const msg = "database error";
      messageQuery.createMessage = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await controller.postMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(500);
        expect(mockSend.mock.calls[0][0]).toEqual({ detail: msg });
      } catch (e) {
        throw e;
      }
    });
  });

  describe("getMessagesInChannel", () => {
    it("should respond an array of messages", async () => {
      expect.assertions(2);
      try {
        await controller.getMessagesInChannel(req, res, next);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "success",
          messages,
        });
        expect(mockStatus.mock.calls[0][0]).toEqual(200);
      } catch (e) {
        throw e;
      }
    });
    it("should validate channelId", async () => {
      expect.assertions(2);
      req.params.channelId = nanoid();
      try {
        await controller.getMessagesInChannel(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: `invalid channel ID: ${req.params.channelId}`,
        });
      } catch (e) {
        throw e;
      }
    });
    it("should validate requesterId", async () => {
      expect.assertions(2);
      req.session.userId = nanoid();
      try {
        await controller.getMessagesInChannel(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "invalid requester ID",
        });
      } catch (e) {
        throw e;
      }
    });
    it("should respond HTTP 400 if requester is not a member of channel", async () => {
      expect.assertions(2);
      userQuery.getUsersByChannelId = jest
        .fn()
        .mockReturnValue([{ id: uuid() }, { id: uuid() }]);
      try {
        await controller.getMessagesInChannel(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "requester is not a member of channel",
        });
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 500 for any other errors", async () => {
      expect.assertions(2);
      const msg = "db error";
      messageQuery.getMessagesInChannel = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await controller.getMessagesInChannel(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(500);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: msg,
        });
      } catch (e) {
        throw e;
      }
    });
  });

  describe("getSpecificMessageInChannel", () => {
    beforeEach(() => {
      req.params.messageId = uuid();
      // req.params.channelId = uuid();
      messageQuery.getSpecificMessage = jest.fn().mockReturnValue(message);
    });

    it("should respond a message", async () => {
      expect.assertions(2);
      try {
        await controller.getSpecificMessageInChannel(req, res, next);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "success",
          message,
        });
        expect(mockStatus.mock.calls[0][0]).toEqual(200);
      } catch (e) {
        throw e;
      }
    });

    it("should validate messageId", async () => {
      expect.assertions(2);
      req.params.messageId = nanoid();
      try {
        await controller.getSpecificMessageInChannel(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "invalid message ID",
        });
      } catch (e) {
        throw e;
      }
    });

    it("should validate channelId", async () => {
      expect.assertions(2);
      req.params.channelId = nanoid();
      try {
        await controller.getSpecificMessageInChannel(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: `invalid channel ID: ${req.params.channelId}`,
        });
      } catch (e) {
        throw e;
      }
    });

    it("should validate requesterId", async () => {
      expect.assertions(2);
      req.session.userId = nanoid();
      try {
        await controller.getSpecificMessageInChannel(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "invalid requester ID",
        });
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 400 if requester is not a member of channel", async () => {
      expect.assertions(2);
      userQuery.getUsersByChannelId = jest
        .fn()
        .mockReturnValue([{ id: uuid() }, { id: uuid() }]);
      try {
        await controller.getSpecificMessageInChannel(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "requester is not a member of channel",
        });
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 400 if message doesn't exist", async () => {
      expect.assertions(2);
      messageQuery.getSpecificMessage = jest.fn().mockReturnValue(null);
      try {
        await controller.getSpecificMessageInChannel(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: `couldn't find the message - channel ID: ${channelId}, message ID: ${req.params.messageId}`,
        });
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 500 for any other errors", async () => {
      expect.assertions(2);
      const msg = "error";
      messageQuery.getSpecificMessage = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await controller.getSpecificMessageInChannel(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(500);
        expect(mockSend.mock.calls[0][0]).toEqual({ detail: msg });
      } catch (e) {
        throw e;
      }
    });
  });

  describe("editMessage", () => {
    let messageId: string;
    let updated: any;

    beforeEach(() => {
      messageId = uuid();
      updated = {
        id: message.id,
        channelId,
        content: nanoid(),
        sender: { id: requesterId },
      };
      req.params.messageId = messageId;
      messageQuery.editMessage = jest.fn().mockReturnValue(1);
      messageQuery.getSpecificMessage = jest.fn().mockReturnValue(message);
    });

    it("should update a message and respond 1", async () => {
      expect.assertions(2);
      try {
        await controller.editMessage(req, res, next);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "success",
          updated: 1,
        });
        expect(mockStatus.mock.calls[0][0]).toEqual(200);
      } catch (e) {
        throw e;
      }
    });

    it("should validate messageId", async () => {
      expect.assertions(2);
      req.params.messageId = nanoid();
      try {
        await controller.editMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "invalid message ID",
        });
      } catch (e) {
        throw e;
      }
    });

    it("should validate channelId", async () => {
      expect.assertions(2);
      req.params.channelId = nanoid();
      try {
        await controller.editMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: `invalid channel ID: ${req.params.channelId}`,
        });
      } catch (e) {
        throw e;
      }
    });

    it("should validate requesterId", async () => {
      expect.assertions(2);
      req.session.userId = nanoid();
      try {
        await controller.editMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "invalid requester ID",
        });
      } catch (e) {
        throw e;
      }
    });
    it("should respond HTTP 400 if requester is NOT A SENDER", async () => {
      expect.assertions(2);
      message.sender.id = uuid();
      messageQuery.getSpecificMessage = jest.fn().mockReturnValue(message);
      try {
        await controller.editMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "you can't edit other user's message",
        });
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 400 if not exists", async () => {
      expect.assertions(2);
      message.sender.id = uuid();
      messageQuery.getSpecificMessage = jest.fn().mockReturnValue(null);
      try {
        await controller.editMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "message doesn't exist",
        });
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 500 for any other errors", async () => {
      expect.assertions(2);
      const msg = "errrrrr";
      messageQuery.editMessage = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await controller.editMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(500);
        expect(mockSend.mock.calls[0][0]).toEqual({ detail: msg });
      } catch (e) {
        throw e;
      }
    });
  });

  describe("deleteMessage", () => {
    beforeEach(() => {
      req.params.messageId = uuid();
      messageQuery.getSpecificMessage = jest.fn().mockReturnValue(message);
      messageQuery.deleteMessage = jest.fn().mockReturnValue(1);
    });

    it("should respond 1", async () => {
      expect.assertions(2);
      try {
        await controller.deleteMessage(req, res, next);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "success",
          count: 1,
        });
        expect(mockStatus.mock.calls[0][0]).toEqual(204);
      } catch (e) {
        throw e;
      }
    });

    it("should validate messageId", async () => {
      expect.assertions(2);
      req.params.messageId = nanoid();
      try {
        await controller.deleteMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: `invalid message ID: ${req.params.messageId}`,
        });
      } catch (e) {
        throw e;
      }
    });

    it("should validate channelId", async () => {
      expect.assertions(2);
      req.params.channelId = nanoid();
      try {
        await controller.deleteMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: `invalid channel ID: ${req.params.channelId}`,
        });
      } catch (e) {
        throw e;
      }
    });

    it("should validate requesterId", async () => {
      expect.assertions(2);
      req.session.userId = nanoid();
      try {
        await controller.deleteMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: `invalid requester ID: ${req.session.userId}`,
        });
      } catch (e) {
        throw e;
      }
    });
    it("should respond HTTP 400 if message does not exist", async () => {
      expect.assertions(2);
      messageQuery.getSpecificMessage = jest.fn().mockReturnValue(null);
      try {
        await controller.deleteMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: `message doesn't exist: ${req.params.channelId} - ${req.params.messageId}`,
        });
      } catch (e) {
        throw e;
      }
    });
    it("should respond HTTP 400 if requester is NOT A SENDER", async () => {
      expect.assertions(2);
      messageQuery.getSpecificMessage = jest
        .fn()
        .mockReturnValue({ sender: { id: uuid() } });
      try {
        await controller.deleteMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(400);
        expect(mockSend.mock.calls[0][0]).toEqual({
          detail: "you can't edit other user's message",
        });
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 500 for any other errors", async () => {
      expect.assertions(2);
      const detail = nanoid();
      messageQuery.deleteMessage = jest.fn().mockImplementation(() => {
        throw new Error(detail);
      });
      try {
        await controller.deleteMessage(req, res, next);
        expect(mockStatus.mock.calls[0][0]).toEqual(500);
        expect(mockSend.mock.calls[0][0]).toEqual({ detail });
      } catch (e) {
        throw e;
      }
    });
  });
});
