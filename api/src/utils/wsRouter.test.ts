import { Server, Socket } from "socket.io";
import { nanoid } from "nanoid";

import {
  Callback,
  CallbackOnConnection,
  getWSRouter,
  WSRouter,
} from "./wsRouter";

describe("WSRouter", () => {
  let router: WSRouter<string>;
  let io: Server;
  let eventName: string;
  let socket: Socket;
  let callback: Callback;
  let callbackOnConnection: CallbackOnConnection;
  let mockOnMethod: jest.Mock;
  let mockCallbackOnConnection: jest.Mock;

  beforeEach(() => {
    eventName = nanoid();
    callback = async <T>(s: Socket, d: T) => {
      console.log(s, d);
    };
    callbackOnConnection = async (s: Socket) => {
      console.log(s);
    };
    socket = {} as any;
    io = {
      on: jest.fn(),
    } as any;
    mockOnMethod = io.on as jest.Mock;
    mockCallbackOnConnection = callbackOnConnection as jest.Mock;
    router = getWSRouter(io);
  });

  describe("on method", () => {
    it("should add callback to events object", () => {
      expect.assertions(1);
      // add event and callback
      router.on(eventName, callback);
      expect(router.getEvent(eventName)).toEqual(callback);
    });
  });

  describe("getEvent method", () => {
    it("should return null if no event handler is added", () => {
      expect.assertions(1);
      expect(router.getEvent(eventName)).toEqual(null);
    });
  });

  describe("onConnect method", () => {
    it("should invoke io.on method", async () => {
      expect.assertions(1);
      router.onConnect();
      expect(mockOnMethod.mock.calls[0][0]).toEqual("connection");
    });

    it("should register an event handler", async () => {
      // expect.assertions(1);
      // register event handler
      // emit event
      // check if the handler has benn invoked
    });
  });
});
