import { Server, Socket } from "socket.io";
import { nanoid } from "nanoid";
import { createServer, Server as HTTPServer } from "http";
import Client, { Socket as ClientSocket } from "socket.io-client";

import { getWSRouter, WSRouter } from "./wsRouter";

describe("WSRouter", () => {
  let router: WSRouter;
  let io: Server;
  let httpServer: HTTPServer;
  let serverSocket: Socket;
  let clientSocket: ClientSocket;
  let eventName: string;
  let data: string;
  let cb: (io: Server, socket: Socket, data: string) => Promise<void>;
  let onConnectionCb: (io: Server, socket: Socket) => Promise<void>;
  const port = 3000;

  beforeAll(() => {
    /**
     * beforeAll function creates WebSocket Server and Client,
     * and then connect each other.
     */
    httpServer = createServer();
    io = new Server(httpServer);
    httpServer.listen(port, () => {});
    onConnectionCb = async (io: Server, socket: Socket) => {
      serverSocket = socket;
    };
  });

  beforeEach(() => {
    data = nanoid();
    eventName = nanoid();
    router = getWSRouter(io);
  });

  afterAll(() => {
    /**
     * afterAll function close WebSocket connection between server and client
     */
    httpServer.close();
    io.close();
  });

  it("should invoke registered event handdler when the event is emmited", (done) => {
    expect.assertions(1);
    clientSocket = Client(`http://localhost:${port}`);
    cb = async (io, s, m) => {
      expect(m).toBe(data);
      clientSocket.close();
      done();
    };
    // register event
    router.on(eventName, cb);
    router.onConnect(onConnectionCb);
    // emit event
    clientSocket.emit(eventName, data);
  });

  it("should invoke registered event handdler without onConnection callback", (done) => {
    expect.assertions(1);
    clientSocket = Client(`http://localhost:${port}`);
    // register event
    router.on(eventName, async (io, s, m) => {
      expect(m).toBe(data);
      clientSocket.close();
      done();
    });
    // on connection handler > register all event handlers
    router.onConnect();
    // emit event
    clientSocket.emit(eventName, data);
  });

  it("should close the connection if an initial callback throw an error", (done) => {
    expect.assertions(1);
    let server: Socket;
    const port = 3333;
    const http = createServer();
    const io = new Server(http);
    http.listen(port);
    const router = getWSRouter(io);
    const client = Client(`http://localhost:${port}`);
    // register on connection event handler
    router.onConnect(async (io, socket) => {
      server = socket;
      return new Promise((_, reject) => reject("some err"));
    });
    // register on disconnect event handler
    client.on("disconnect", (reason) => {
      expect(reason).toBe("io server disconnect");
      client.close();
      done();
    });
    client.emit("my test", data);
  });

  // test for getevetn
});
