// import { it, beforeAll, afterAll, jest, expect } from "@jest/globals";
import { v4 as uuid } from "uuid";
import { nanoid } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { createServer, Server as HTTPServer } from "http";
import { Server, Socket as ServerSocket } from "socket.io";

import { WebSocketComponent } from "./WebSocketComponent";
import { store } from "../../../utils/store";
import Client, { Socket } from "socket.io-client";

let http: HTTPServer;
let io: Server;
let clientSocket: Socket;
let serverSocket: ServerSocket;
const port = 3333;
const cLog = console.log;
const cGroup = console.group;

let channelId = uuid();
const mockMessages: Message[] = [
  {
    id: uuid(),
    channelId,
    content: nanoid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    sender: { id: uuid(), username: uuid() },
  },
];
const mockChannel = {
  id: channelId,
  name: "test channel",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  users: [],
  messages: mockMessages,
};

const isOnChatMessageInvoked = false;
const isOnJoinNewChannelInvoked = false;

let mockFunc = jest.fn();

// jest.mock("../../../utils/thunk-middlewares", () => ({
//   // thunkOnChatMessage: () => () => {
//   //   isOnChatMessageInvoked = true;
//   // },
//   thunkGetChannelMessages: (channelId: string) => {
//     console.log("channelId:", channelId);
//     return mockFunc;
//   },
// }));
beforeAll((done) => {
  console.log = jest.fn();
  console.group = jest.fn();
  if (!done) throw new Error("done() is undefined!");
  // create ws server
  http = createServer();
  io = new Server(http);
  http.listen(port, () => {
    // register event handler
    io.on("connection", (socket) => {
      serverSocket = socket;
    });
    // time for client to connect to server
    clientSocket = Client(`http://localhost:${port}`);
    clientSocket.on("connect", () => done());
  });
});

beforeEach(() => {
  channelId = uuid();
  mockFunc = jest.fn();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll((done) => {
  if (!done) throw new Error("done() is undefined!");
  clientSocket.disconnect();
  io.close(() => {
    http.close(() => {
      // set console.log and console.group
      console.log = cLog;
      console.group = cGroup;
      done();
    });
  });
});

it("should render null", () => {
  expect.assertions(1);
  console.log("1st:", channelId);
  const { container } = render(
    <Provider store={store}>
      <WebSocketComponent socket={clientSocket} />
    </Provider>
  );
  expect(container.firstChild).toBeNull();
});

// it("should invoke onJoinNewChannel", (done) => {
//   if (!done) throw new Error("done() is undefined!");
//   expect.assertions(1);
//   console.log("2nd:", channelId);
//   render(
//     <Provider store={store}>
//       <WebSocketComponent socket={clientSocket} />
//     </Provider>
//   );
//   // send "chat message" event
//   serverSocket.emit("joined a new room", { channelId });
//   setTimeout(() => {
//     // expect(isOnJoinNewChannelInvoked).toEqual(true);
//     // expect(mockFunc.mock.calls.length).toEqual(1);
//     done();
//   }, 100);
// });

// it("should invoke onChatMessage", (done) => {
//   if (!done) throw new Error("done() is undefined!");
//   expect.assertions(1);
//   const message: Message = {
//     id: uuid(),
//     channelId: uuid(),
//     content: nanoid(),
//     sender: { id: uuid(), username: nanoid() },
//     createdAt: Date.now(),
//     updatedAt: Date.now(),
//   };
//   render(
//     <Provider store={store}>
//       <WebSocketComponent socket={clientSocket} />
//     </Provider>
//   );
//   // send "chat message" event
//   serverSocket.emit("chat message", message);
//   setTimeout(() => {
//     expect(isOnChatMessageInvoked).toEqual(true);
//     done();
//   }, 100);
// });
