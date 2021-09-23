import { nanoid } from "nanoid";
import { any } from "sequelize/types/lib/operators";
import { Server, Socket } from "socket.io";
import { v4 as uuid } from "uuid";

import { ChatConfigType } from "../config";
import { Queries } from "../queries/query";
import {
  getWSController,
  sendExceptionToSender,
  WSController,
} from "./wsController";

describe("wsController", () => {
  let controller: WSController;
  let config: ChatConfigType;
  let queries: Queries;
  let io: Server;
  let socket: Socket;
  let userId: string;
  let username: string;
  let channels: { id: string }[];
  let users: { id: string }[];
  let mockJoin: jest.Mock;
  let mockEmit: jest.Mock;
  let mockDisconnect: jest.Mock;
  let data: Message;

  beforeEach(() => {
    userId = uuid();
    username = nanoid();
    channels = [{ id: uuid() }, { id: uuid() }, { id: uuid() }];
    users = [{ id: userId }, { id: uuid() }, { id: uuid() }];
    data = {
      id: uuid(),
      channelId: uuid(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sender: { id: userId, username },
      content: uuid(),
    };
    io = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;
    socket = {
      id: userId,
      request: { session: { userId, username } },
      join: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    } as any;
    config = {
      kafka: {
        producer: {
          send: jest.fn(),
        },
      },
    } as any;
    queries = {
      channelQuery: {
        getChannelsByUserId: jest.fn().mockReturnValue(channels),
        getChannelByChannelIdWithMessages: jest.fn(),
        getChannelById: jest.fn(),
        createChannel: jest.fn(),
        deleteChannelById: jest.fn(),
        updateChannelbyId: jest.fn(),
      },
      userQuery: {
        getUsersByChannelId: jest.fn().mockReturnValue(users),
        getOtherUsers: jest.fn(),
        getUserById: jest.fn(),
        getUserByUsername: jest.fn(),
        deleteUserById: jest.fn(),
        createUser: jest.fn(),
      },
      messageQuery: {
        getMessagesInChannel: jest.fn().mockReturnValue([]),
        getSpecificMessage: jest.fn(),
        deleteMessage: jest.fn(),
        createMessage: jest.fn(),
        editMessage: jest.fn(),
      },
      rosterQuery: {} as any,
    } as Queries;
    mockJoin = socket.join as jest.Mock;
    mockEmit = socket.emit as jest.Mock;
    mockDisconnect = socket.disconnect as jest.Mock;
    controller = getWSController(config, queries);
  });

  describe("onConnection", () => {
    it("should make user join belonging channels", async () => {
      expect.assertions(1);
      try {
        await controller.onConnection(io, socket);
        expect(mockJoin.mock.calls[0][0]).toEqual(channels.map((ch) => ch.id));
      } catch (e) {
        throw e;
      }
    });

    it("should throw an error if user is not authenticated", async () => {
      expect.assertions(1);
      try {
        socket.request.session = {} as any;
        await controller.onConnection(io, socket);
      } catch (e) {
        if (e instanceof Error)
          expect(e.message).toEqual("user is not authenticated");
      }
    });

    it("should throw an error for any other reasons", async () => {
      expect.assertions(1);
      const msg = nanoid();
      queries.channelQuery.getChannelsByUserId = jest
        .fn()
        .mockImplementation(() => {
          throw new Error(msg);
        });
      try {
        await controller.onConnection(io, socket);
      } catch (e) {
        if (e instanceof Error) expect(e.message).toEqual(msg);
      }
    });
  });

  describe("sendExceptionToSender", () => {
    it("should invoke emit method", () => {
      sendExceptionToSender(socket, {
        code: 400,
        detail: "xx",
        timestamp: 123,
      });
      expect(socket.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe("onChatMessage", () => {
    it("should send MeesageAdded event to kafka", async () => {
      expect.assertions(3);
      try {
        await controller.onChatMessage(io, socket, data);
        expect(config.kafka.producer.send).toHaveBeenCalledTimes(1);
        expect(io.to).toHaveBeenCalledTimes(1);
        expect(io.emit).toHaveBeenCalledTimes(1);
      } catch (e) {
        throw e;
      }
    });

    it("should validate socket.request.session", async () => {
      expect.assertions(1);
      socket.request.session = {} as any;
      try {
        await controller.onChatMessage(io, socket, data);
        expect(mockEmit.mock.calls[0][0]).toEqual("exception");
      } catch (e) {
        throw e;
      }
    });

    it("should validate payload", async () => {
      expect.assertions(1);
      data.channelId = "xxx";
      try {
        await controller.onChatMessage(io, socket, data);
        expect(mockEmit.mock.calls[0][0]).toEqual("exception");
      } catch (e) {
        throw e;
      }
    });

    it("should check if payload.sender and socket.request.session is the same", async () => {
      expect.assertions(1);
      data.sender.id = uuid();
      try {
        await controller.onChatMessage(io, socket, data);
        expect(mockEmit.mock.calls[0][0]).toEqual("exception");
      } catch (e) {
        throw e;
      }
    });

    it("should check requester is a member of channel", async () => {
      expect.assertions(1);
      queries.userQuery.getUsersByChannelId = jest.fn().mockReturnValue([]);
      try {
        await controller.onChatMessage(io, socket, data);
        expect(mockEmit.mock.calls[0][0]).toEqual("exception");
      } catch (e) {
        throw e;
      }
    });

    it("should send exception payload with code 500", async () => {
      expect.assertions(2);
      queries.messageQuery.getSpecificMessage = jest
        .fn()
        .mockImplementation(() => {
          throw new Error("err");
        });
      try {
        await controller.onChatMessage(io, socket, data);
        expect(mockEmit.mock.calls[1][0]).toEqual("exception");
        expect(mockEmit.mock.calls[1][1].code).toEqual(500);
      } catch (e) {
        console.log("error:", e);
        throw e;
      }
    });
  });

  describe("onException", () => {
    it("should call socket.disconnect(true)", async () => {
      expect.assertions(2);
      try {
        await controller.onException(io, socket, {});
        expect(mockDisconnect).toHaveBeenCalledTimes(1);
        expect(mockDisconnect.mock.calls[0][0]).toEqual(true);
      } catch (e) {
        throw e;
      }
    });
  });
});
