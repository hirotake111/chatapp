import { nanoid } from "nanoid";
import { v4 as uuid } from "uuid";

import Message from "../models/Message.model";
import { getMessageQuery, MessageQuery } from "./messageQuery";

// helper function to create a message
const createMessage = (count: number = 1) => {
  const messages: any[] = [];
  for (let i = 0; i < count; i++) {
    messages.push({
      id: uuid(),
      channelId: uuid(),
      senderId: uuid(),
      content: nanoid(),
    });
  }
  return messages;
};

describe("messageQuery", () => {
  let requesterId: string;
  let channelId: string;
  let messageId: string;
  let content: string;
  let newContent: string;
  let messageModel: typeof Message;
  let query: MessageQuery;

  beforeEach(() => {
    messageId = uuid();
    channelId = uuid();
    content = nanoid();
    newContent = nanoid();
    requesterId = uuid();
    messageModel = {
      create: jest.fn().mockReturnValue({
        id: messageId,
        channelId,
        senderId: requesterId,
        content,
      }),
      findAll: jest.fn().mockReturnValue(createMessage(5)),
      findOne: jest.fn(),
      update: jest
        .fn()
        .mockReturnValue({ id: messageId, channelId, content: newContent }),
      destroy: jest.fn(),
    } as any;
    query = getMessageQuery({ messageModel });
  });

  describe("createMessage()", () => {
    it("should create a message", async () => {
      expect.assertions(1);
      try {
        const message = await query.createMessage(
          messageId,
          channelId,
          requesterId,
          content
        );
        expect(message).toEqual({
          id: messageId,
          channelId,
          senderId: requesterId,
          content,
        });
      } catch (e) {
        throw e;
      }
    });

    it("should return null if messageId already exists", async () => {
      expect.assertions(1);
      messageModel.findOne = jest
        .fn()
        .mockReturnValue({ id: messageId, channelId: channelId });
      try {
        const message = await query.createMessage(
          messageId,
          channelId,
          requesterId,
          content
        );
        expect(message).toBeNull();
      } catch (e) {
        throw e;
      }
    });

    it("should validate messageId", async () => {
      expect.assertions(1);
      try {
        await query.createMessage(nanoid(), channelId, requesterId, content);
      } catch (e) {
        expect(e.message).toEqual("invalid message ID");
      }
    });

    it("should validate channelId", async () => {
      expect.assertions(1);
      try {
        await query.createMessage(messageId, nanoid(), requesterId, content);
      } catch (e) {
        expect(e.message).toEqual("invalid channel ID");
      }
    });

    it("should validate senderId", async () => {
      expect.assertions(1);
      try {
        await query.createMessage(messageId, channelId, nanoid(), content);
      } catch (e) {
        expect(e.message).toEqual("invalid sender ID");
      }
    });

    it("should raise an error if new content is empty", async () => {
      expect.assertions(1);
      try {
        await query.createMessage(messageId, channelId, requesterId, "");
      } catch (e) {
        expect(e.message).toEqual("content can't be empty");
      }
    });
    it("should raise an error for any other errors", async () => {
      expect.assertions(1);
      const msg = "db error";
      messageModel.create = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await query.createMessage(messageId, channelId, requesterId, content);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("getMessagesInChannel()", () => {
    it("should get an array of messages", async () => {
      expect.assertions(1);
      try {
        const messages = await query.getMessagesInChannel(channelId);
        expect(messages.length).toEqual(5);
      } catch (e) {
        throw e;
      }
    });

    it("should validate channelId", async () => {
      expect.assertions(1);
      try {
        await query.getMessagesInChannel(nanoid());
      } catch (e) {
        expect(e.message).toEqual("invalid channel ID");
      }
    });

    it("should raise an error for any other errors", async () => {
      expect.assertions(1);
      const msg = "errorrrrr";
      messageModel.findAll = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await query.getMessagesInChannel(channelId);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("getSpecificMessageInChannel()", () => {
    const returnValue = {
      id: messageId,
      channelId,
      senderId: requesterId,
      content,
    };
    beforeEach(() => {
      messageModel.findOne = jest.fn().mockReturnValue(returnValue);
    });
    it("should get a message", async () => {
      expect.assertions(1);
      try {
        const message = await query.getSpecificMessage(messageId);
        expect(message).toEqual(returnValue);
      } catch (e) {
        throw e;
      }
    });

    it("should validate messageId", async () => {
      expect.assertions(1);
      try {
        await query.getSpecificMessage(nanoid());
      } catch (e) {
        expect(e.message).toEqual("invalid message ID");
      }
    });

    it("should raise an error for any other errors", async () => {
      expect.assertions(1);
      const msg = nanoid();
      messageModel.findOne = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await query.getSpecificMessage(messageId);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("editMessage()", () => {
    let existingMessage: any;
    beforeEach(() => {
      existingMessage = { id: messageId, channelId, content };
      messageModel.findOne = jest.fn().mockReturnValue(existingMessage);
      messageModel.update = jest
        .fn()
        .mockReturnValue([1, [{ ...existingMessage, content: newContent }]]);
    });

    it("should edit and return a message", async () => {
      expect.assertions(2);
      try {
        const message = await query.editMessage(messageId, newContent);
        expect(message).toEqual({
          id: messageId,
          channelId,
          content: newContent,
        });
        expect(messageModel.update).toHaveBeenCalledWith(
          { content: newContent },
          { where: { id: messageId } }
        );
      } catch (e) {
        throw e;
      }
    });

    it("should validate messageId", async () => {
      expect.assertions(1);
      try {
        await query.editMessage(nanoid(), newContent);
      } catch (e) {
        expect(e.message).toEqual("invalid message ID");
      }
    });

    it("should raise an error if new content is empty", async () => {
      expect.assertions(1);
      try {
        await query.editMessage(messageId, "");
      } catch (e) {
        expect(e.message).toEqual("content can't be empty");
      }
    });
    it("should return null if messageId does not exist", async () => {
      expect.assertions(1);
      messageModel.findOne = jest.fn().mockReturnValue(null);
      try {
        const message = await query.editMessage(messageId, newContent);
        expect(message).toBeNull();
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error for any other errors", async () => {
      expect.assertions(1);
      const msg = "database error";
      messageModel.update = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await query.editMessage(messageId, newContent);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("deleteMessage()", () => {
    beforeEach(() => {
      messageModel.destroy = jest.fn().mockReturnValue(1);
    });
    it("should delete and return 1", async () => {
      expect.assertions(2);
      try {
        expect(await query.deleteMessage(messageId)).toEqual(1);
        expect(messageModel.destroy).toHaveBeenCalledWith({
          where: { id: messageId },
        });
      } catch (e) {
        throw e;
      }
    });

    it("should validate messageId", async () => {
      expect.assertions(1);
      try {
        await query.deleteMessage(nanoid());
      } catch (e) {
        expect(e.message).toEqual("invalid message ID");
      }
    });

    it("should return 0 if it does not exist in database", async () => {
      expect.assertions(1);
      messageModel.destroy = jest.fn().mockReturnValue(0);
      try {
        expect(await query.deleteMessage(messageId)).toEqual(0);
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error for any other errors", async () => {
      expect.assertions(1);
      const msg = "database error!";
      messageModel.destroy = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await query.deleteMessage(messageId);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });
});
