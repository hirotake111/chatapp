import { KafkaMessage } from "kafkajs";
import { v4 as uuid } from "uuid";
import { nanoid } from "nanoid";

import { Queries } from "../queries/query";
import { getChatAggrigator } from "./chatAggrigator";

describe("chatAggrigator", () => {
  let queries: Queries;
  let message: KafkaMessage;
  let value: ChatEvent;
  let mockCreateMessage: jest.Mock;
  let mockDeleteMessage: jest.Mock;
  let mockUpdateMessage: jest.Mock;
  let mockCreateChannel: jest.Mock;
  let mockDeleteChannel: jest.Mock;
  let mockUpdateChannel: jest.Mock;
  let mockAddUserToChannel: jest.Mock;
  let mockDeleteUserFromChannel: jest.Mock;
  let aggrigator: any;
  let messageId: string;
  let channelId: string;
  let sender: { id: string; name: string };
  let content: string;
  let channelName: string;
  let memberIds: string[];

  beforeEach(() => {
    queries = {
      userQuery: {} as any,
      channelQuery: {
        createChannel: jest.fn().mockReturnValue(1),
        updateChannelbyId: jest.fn().mockReturnValue(1),
        deleteChannelById: jest.fn().mockReturnValue(1),
        getChannelByChannelIdWithMessages: jest.fn(),
        getChannelById: jest.fn(),
        getChannelsByUserId: jest.fn(),
      },
      messageQuery: {
        createMessage: jest.fn().mockReturnValue(1),
        getMessagesInChannel: jest.fn(),
        getSpecificMessage: jest.fn(),
        editMessage: jest.fn(),
        deleteMessage: jest.fn().mockReturnValue(1),
      },
      rosterQuery: {
        addUserToChannel: jest.fn().mockReturnValue(1),
        deleteUserFromChannel: jest.fn(),
      },
    };
    mockCreateMessage = queries.messageQuery.createMessage as jest.Mock;
    mockDeleteMessage = queries.messageQuery.deleteMessage as jest.Mock;
    mockUpdateMessage = queries.messageQuery.editMessage as jest.Mock;
    mockCreateChannel = queries.channelQuery.createChannel as jest.Mock;
    mockUpdateChannel = queries.channelQuery.updateChannelbyId as jest.Mock;
    mockDeleteChannel = queries.channelQuery.deleteChannelById as jest.Mock;
    mockAddUserToChannel = queries.rosterQuery.addUserToChannel as jest.Mock;
    mockDeleteUserFromChannel = queries.rosterQuery
      .deleteUserFromChannel as jest.Mock;
    aggrigator = getChatAggrigator(queries);
  });

  describe("createMessage", () => {
    beforeEach(() => {
      messageId = uuid();
      channelId = uuid();
      sender = { id: uuid(), name: nanoid() };
      content = nanoid();
      value = {
        id: uuid(),
        type: "MessageAdded",
        metadata: { traceId: uuid(), timestamp: Date.now() },
        data: { addMessage: { messageId, channelId, sender, content } },
      };
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
    });

    it("should create a new message", async () => {
      expect.assertions(1);
      try {
        await aggrigator.process(message);
        expect(mockCreateMessage.mock.calls[0]).toEqual([
          messageId,
          channelId,
          sender.id,
          content,
        ]);
      } catch (e) {
        throw e;
      }
    });

    it("should throw an error if input value is invalid", async () => {
      expect.assertions(1);
      value.data.addMessage = undefined;
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(`Invalid event data: ${value.data}`);
      }
    });

    it("should throw an error if database returns null", async () => {
      expect.assertions(1);
      queries.messageQuery.createMessage = jest.fn().mockReturnValue(null);
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual("Failed to store a message to database");
      }
    });

    it("should throw an error for any other reason", async () => {
      expect.assertions(1);
      const msg = "database error";
      queries.messageQuery.createMessage = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("deleteMessage", () => {
    beforeEach(() => {
      messageId = uuid();
      channelId = uuid();
      sender = { id: uuid(), name: nanoid() };
      value = {
        id: uuid(),
        type: "MessageDeleted",
        metadata: { traceId: uuid(), timestamp: Date.now() },
        data: { deleteMessage: { messageId, channelId, sender } },
      };
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
    });

    it("should delete a message", async () => {
      expect.assertions(1);
      try {
        await aggrigator.process(message);
        expect(mockDeleteMessage.mock.calls[0][0]).toEqual(messageId);
      } catch (e) {
        throw e;
      }
    });

    it("should throw an error if input value is invalid", async () => {
      expect.assertions(1);
      value.data.deleteMessage = undefined;
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(`Invalid event data: ${value.data}`);
      }
    });

    it("should throw an error for any other reason", async () => {
      expect.assertions(1);
      const msg = "database error";
      queries.messageQuery.deleteMessage = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("updateMessage", () => {
    beforeEach(() => {
      messageId = uuid();
      channelId = uuid();
      sender = { id: uuid(), name: nanoid() };
      content = nanoid();
      value = {
        id: uuid(),
        type: "MessageUpdated",
        metadata: { traceId: uuid(), timestamp: Date.now() },
        data: { updateMessage: { messageId, channelId, sender, content } },
      };
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
    });

    it("should update message", async () => {
      expect.assertions(1);
      try {
        await aggrigator.process(message);
        expect(mockUpdateMessage.mock.calls[0]).toEqual([
          messageId,
          channelId,
          content,
        ]);
      } catch (e) {
        throw e;
      }
    });

    it("should throw an error if input value is invalid", async () => {
      expect.assertions(1);
      value.data.updateMessage = undefined;
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(`Invalid event data: ${value.data}`);
      }
    });

    it("should throw an error for any other reason", async () => {
      expect.assertions(1);
      const msg = "database error";
      queries.messageQuery.editMessage = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("createChannel", () => {
    beforeEach(() => {
      channelId = uuid();
      channelName = nanoid();
      sender = { id: uuid(), name: nanoid() };
      memberIds = [uuid()];
      value = {
        id: uuid(),
        type: "ChannelCreated",
        metadata: { traceId: uuid(), timestamp: Date.now() },
        data: { createChannel: { channelId, channelName, sender, memberIds } },
      };
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
    });

    it("should create a new channel", async () => {
      expect.assertions(2);
      try {
        await aggrigator.process(message);
        expect(mockCreateChannel.mock.calls[0]).toEqual([
          channelId,
          channelName,
        ]);
        expect(mockAddUserToChannel).toHaveBeenCalledTimes(2);
      } catch (e) {
        throw e;
      }
    });

    it("should not call command if no memberIds", async () => {
      expect.assertions(1);
      value = {
        id: uuid(),
        type: "ChannelCreated",
        metadata: { traceId: uuid(), timestamp: Date.now() },
        data: {
          createChannel: { channelId, channelName, sender, memberIds: [] },
        },
      };
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
      try {
        await aggrigator.process(message);
        expect(mockAddUserToChannel).toHaveBeenCalledTimes(1);
      } catch (e) {
        throw e;
      }
    });

    it("should throw an error if input value is invalid", async () => {
      expect.assertions(1);
      value.data.createChannel = undefined;
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(`Invalid event data: ${value.data}`);
      }
    });

    it("should throw an error if database returns null", async () => {
      expect.assertions(1);
      queries.channelQuery.createChannel = jest.fn().mockReturnValue(null);
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual("Failed to store a channel to database");
      }
    });

    it("should throw an error if database returns null for roster", async () => {
      expect.assertions(1);
      queries.rosterQuery.addUserToChannel = jest.fn().mockReturnValue(null);
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(
          `Failed to add requester ${sender.id} to channel ${channelId}`
        );
      }
    });

    it("should throw an error for any other reason", async () => {
      expect.assertions(1);
      const msg = "database error";
      queries.channelQuery.createChannel = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("updateChannel", () => {
    beforeEach(() => {
      channelId = uuid();
      channelName = nanoid();
      sender = { id: uuid(), name: nanoid() };
      value = {
        id: uuid(),
        type: "ChannelUpdated",
        metadata: { traceId: uuid(), timestamp: Date.now() },
        data: {
          updateChannel: { channelId, newChannelName: channelName, sender },
        },
      };
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
    });

    it("should update channel", async () => {
      expect.assertions(1);
      try {
        await aggrigator.process(message);
        expect(mockUpdateChannel.mock.calls[0]).toEqual([
          channelId,
          channelName,
        ]);
      } catch (e) {
        throw e;
      }
    });

    it("should throw an error if input value is invalid", async () => {
      expect.assertions(1);
      value.data.updateChannel = undefined;
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(`Invalid event data: ${value.data}`);
      }
    });

    it("should throw an error for any other reason", async () => {
      expect.assertions(1);
      const msg = "database error";
      queries.channelQuery.updateChannelbyId = jest
        .fn()
        .mockImplementation(() => {
          throw new Error(msg);
        });
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("deleteChannel", () => {
    beforeEach(() => {
      channelId = uuid();
      sender = { id: uuid(), name: nanoid() };
      value = {
        id: uuid(),
        type: "ChannelDeleted",
        metadata: { traceId: uuid(), timestamp: Date.now() },
        data: { deleteChannel: { channelId, sender } },
      };
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
    });

    it("should delete a channel", async () => {
      expect.assertions(1);
      try {
        await aggrigator.process(message);
        expect(mockDeleteChannel.mock.calls[0][0]).toEqual(channelId);
      } catch (e) {
        throw e;
      }
    });

    it("should throw an error if input value is invalid", async () => {
      expect.assertions(1);
      value.data.deleteChannel = undefined;
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(`Invalid event data: ${value.data}`);
      }
    });

    it("should throw an error for any other reason", async () => {
      expect.assertions(1);
      const msg = "database error";
      queries.channelQuery.deleteChannelById = jest
        .fn()
        .mockImplementation(() => {
          throw new Error(msg);
        });
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("addUserToChannel", () => {
    beforeEach(() => {
      channelId = uuid();
      sender = { id: uuid(), name: nanoid() };
      memberIds = [uuid(), uuid(), uuid()];
      value = {
        id: uuid(),
        type: "UsersJoined",
        metadata: { traceId: uuid(), timestamp: Date.now() },
        data: { addUsersToChannel: { channelId, sender, memberIds } },
      };
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
    });

    it("should add users to channel", async () => {
      expect.assertions(1);
      try {
        await aggrigator.process(message);
        expect(mockAddUserToChannel).toHaveBeenCalledTimes(3);
      } catch (e) {
        throw e;
      }
    });

    it("should throw an error if input value is invalid", async () => {
      expect.assertions(1);
      value.data.addUsersToChannel = undefined;
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(`Invalid event data: ${value.data}`);
      }
    });

    it("should throw an error for any other reason", async () => {
      expect.assertions(1);
      const msg = "database error";
      queries.rosterQuery.addUserToChannel = jest
        .fn()
        .mockImplementation(() => {
          throw new Error(msg);
        });
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("removeUserFromChannel", () => {
    beforeEach(() => {
      channelId = uuid();
      sender = { id: uuid(), name: nanoid() };
      memberIds = [uuid(), uuid(), uuid()];
      value = {
        id: uuid(),
        type: "UsersRemoved",
        metadata: { traceId: uuid(), timestamp: Date.now() },
        data: { removeUsersFromChannel: { channelId, sender, memberIds } },
      };
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
    });

    it("should remove users from channel", async () => {
      expect.assertions(1);
      try {
        await aggrigator.process(message);
        expect(mockDeleteUserFromChannel).toHaveBeenCalledTimes(3);
      } catch (e) {
        throw e;
      }
    });

    it("should throw an error if input value is invalid", async () => {
      expect.assertions(1);
      value.data.removeUsersFromChannel = undefined;
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(`Invalid event data: ${value.data}`);
      }
    });

    it("should throw an error for any other reason", async () => {
      expect.assertions(1);
      const msg = "database error";
      queries.rosterQuery.deleteUserFromChannel = jest
        .fn()
        .mockImplementation(() => {
          throw new Error(msg);
        });
      try {
        await aggrigator.process(message);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("default event", () => {
    it("should throw a error if mesage.value is empty", async () => {
      expect.assertions(1);
      try {
        await aggrigator.process({});
      } catch (e) {
        expect(e.message).toEqual("message.value is empty");
      }
    });

    it("should do nothing", async () => {
      value = {
        id: uuid(),
        type: "OtherEvent",
        metadata: { traceId: uuid(), timestamp: Date.now() },
        data: {},
      };
      message = { value: Buffer.from(JSON.stringify(value)) } as any;
      try {
        await aggrigator.process(message);
      } catch (e) {
        throw e;
      }
    });
  });
});
