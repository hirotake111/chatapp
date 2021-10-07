import { createServer } from "http";
import { Server, Socket as ServerSocket } from "socket.io";
import Client, { Socket } from "socket.io-client";
import { v4 as uuid } from "uuid";
import {
  GetChannelMessagesAction,
  ReceiveMessageAction,
} from "../../actions/channelActions";
import {
  getFakeChannel,
  getFakeMessage,
  getFakeMessageWithNoId,
} from "../testHelpers";

import {
  onChatMessage,
  onJoinedNewRoom,
  registerWebSocketEventHandlers,
} from "./eventHandlers";

const mockDispatch = jest.fn();
const mockFetch = jest.fn();

jest.mock("../utils", () => ({
  getChannelMessages: () => Promise.resolve(mockFetch()),
}));

beforeEach(() => {
  mockDispatch.mockClear();
  mockFetch.mockClear();
});

describe("onChatMessage", () => {
  it("should validate message and dispatch action", () => {
    expect.assertions(1);
    const data = getFakeMessage();
    onChatMessage(mockDispatch, data);
    expect(mockDispatch).toHaveBeenCalledWith(ReceiveMessageAction(data));
  });

  it("should throw an error if data is invalid", () => {
    expect.assertions(1);
    const data = getFakeMessageWithNoId();
    try {
      onChatMessage(mockDispatch, data);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual("validation error: data doesn't contain id");
    }
  });
});

describe("onJoinedNewRoom", () => {
  it("should fetch data from server and dispatch an action", async () => {
    expect.assertions(1);
    const channel = getFakeChannel();
    mockFetch.mockReturnValue(channel);
    await onJoinedNewRoom(mockDispatch, { channelId: channel.id });
    expect(mockDispatch).toHaveBeenCalledWith(
      GetChannelMessagesAction(channel)
    );
  });

  it("should console.error if passed data is invalid", async () => {
    expect.assertions(2);
    console.error = jest.fn();
    // data cannot be string
    await onJoinedNewRoom(mockDispatch, "abc");
    expect(console.error).toHaveBeenCalledWith(
      new Error(
        'invalid channelId was given on "joined a new room" event - channelId is undefined'
      )
    );
    // data cannot be falsy value
    await onJoinedNewRoom(mockDispatch, null);
    expect(console.error).toHaveBeenCalledWith(
      new Error(
        'invalid channelId was given on "joined a new room" event - data is null'
      )
    );
  });

  it("should console.error if network call failed", async () => {
    expect.assertions(1);
    console.error = jest.fn();
    const err = new Error("network error");
    mockFetch.mockImplementation(() => {
      throw err;
    });
    await onJoinedNewRoom(mockDispatch, { channelId: uuid() });
    expect(console.error).toHaveBeenCalledWith(err);
  });
});

describe("registerWebSocketEventHandlers", () => {
  let io: Server;
  let client: Socket;
  let server: ServerSocket;

  beforeAll((done) => {
    const http = createServer();
    io = new Server(http);
    http.listen(3333, () => {
      client = Client("http://localhost:3333");
      io.on("connection", (socket) => {
        server = socket;
      });
      client.on("connect", done);
    });
  });

  afterAll(() => {
    // close WebSocket and HTTP server
    io.close();
    client.close();
  });

  it("should register onChatmessage callback", (done) => {
    expect.assertions(1);
    const message = getFakeMessage();
    mockDispatch.mockImplementation((data) => {
      expect(data).toEqual(ReceiveMessageAction(message));
      done();
    });
    // register event handler
    registerWebSocketEventHandlers(client, mockDispatch);
    // emit chat message event
    server.emit("chat message", message);
  });

  it("should register onJoinedNewRoom callback", (done) => {
    expect.assertions(2);
    const channel = getFakeChannel();
    mockFetch.mockReturnValue(channel);
    mockDispatch.mockImplementation((data) => {
      // console.log("data:", data);
      expect(data).toEqual(GetChannelMessagesAction(channel));
      done();
    });
    // register event handler
    registerWebSocketEventHandlers(client, mockDispatch);
    // emit chat message event
    server.emit("joined a new room", { channelId: channel.id });
  });
});
