import { Server, Socket } from "socket.io";

export interface WSRouter {
  /**
   * create io.on event handler, run callback function inside it,
   * then register event hadlers
   */
  onConnect: (callback?: (io: Server, socket: Socket) => Promise<void>) => void;
  /**
   * add an event handler
   */
  on: (
    event: string,
    callback: (io: Server, socket: Socket, data: any) => Promise<void>
  ) => void;
  /**
   * return events object
   */
  getEvent: (
    event: string
  ) => ((io: Server, socket: Socket, data: any) => Promise<void>) | null;
}

export const getWSRouter = (io: Server): WSRouter => {
  // init events object
  const events: {
    [event: string]: (
      io: Server,
      socket: Socket,
      message: any
    ) => Promise<void>;
  } = {};

  return {
    onConnect: (callback?: (io: Server, socket: Socket) => Promise<void>) => {
      io.on("connection", async (socket) => {
        // run callback function
        if (callback) {
          try {
            await callback(io, socket);
          } catch (e) {
            // close WebSocket conneciton
            socket.disconnect(true);
            io.close();
          }
        }
        // debugging purpose
        // socket.onAny((event, data) => console.log("on any: ", event, data));
        // pick up each key from events object
        // create on event handler and invoke callback inside it
        Object.keys(events).forEach((key) => {
          socket.on(key, (data: any) => {
            events[key](io, socket, data);
          });
        });
      });
    },

    on: (
      event: string,
      callback: (io: Server, socket: Socket, data: any) => Promise<void>
    ) => {
      // add event handler callback to events object
      events[event] = callback;
    },

    getEvent: (event: string) => {
      const callback = events[event] ? events[event] : null;
      return callback;
    },
  };
};
