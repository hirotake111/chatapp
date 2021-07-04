import { Server, Socket } from "socket.io";
import { nanoid } from "nanoid";
import { createServer } from "http";
import Client, { Socket as ClientSocket } from "socket.io-client";

import { getWSRouter, WSRouter } from "./wsRouter";

describe("WSRouter", () => {
  let router: WSRouter;
  let io: Server;
  let serverSocket: Socket;
  let clientSocket: ClientSocket;
  let eventName: string;
  let data: string;
  let port: number;
  let socket: Socket;
  let cb: (io: Server, socket: Socket, data: string) => Promise<void>;
  let onConnectionCB: (io: Server, socket: Socket) => Promise<void>;
  let mockOnMethod: jest.Mock;
  let mockCallbackOnConnection: jest.Mock;

  beforeAll(() => {
    /**
     * beforeAll function creates WebSocket Server and Client,
     * and then connect each other.
     */
    const httpServer = createServer();
    port = 3000;
    const URL = `http://localhost:${port}`;
    eventName = nanoid();
    data = nanoid();
    io = new Server(httpServer);
    httpServer.listen(port, () => {});
  });

  afterAll(() => {
    /**
     * afterAll function close WebSocket connection between server and client
     */
    io.close();
    clientSocket.close();
  });

  it("should invoke registered event handdler when the event is emmited", (done) => {
    expect.assertions(1);
    clientSocket = Client(`http://localhost:${port}`);
    router = getWSRouter(io);
    onConnectionCB = async (io: Server, socket: Socket) => {
      serverSocket = socket;
    };
    // onConnection listener on client side
    clientSocket.on("connect", () => {});
    cb = async (io, s, m) => {
      expect(m).toBe(data);
      done();
    };
    // register event
    router.on(eventName, cb);
    router.onConnect(onConnectionCB);
    // emit event
    clientSocket.emit(eventName, data);
  });

  it("should close the connection if an initial callback throw an error", (done) => {
    expect.assertions(1);
    clientSocket = Client(`http://localhost:${port}`);
    router = getWSRouter(io);
    // onConnection listener on client side
    onConnectionCB = jest.fn().mockImplementation(() => {
      throw new Error("some error");
    });
    clientSocket.on("connect", () => {});
    clientSocket.on("disconnect", (reason) => {
      expect(reason).toBe("io server disconnect");
      done();
    });
    // register event
    router.on(eventName, async (s, m) => {
      console.log(s, m);
    });
    // register on connection event handler
    router.onConnect(onConnectionCB);
    clientSocket.emit(eventName, data);
  });

  // test for getevetn
});
