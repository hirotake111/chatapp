import { Server, Socket } from "socket.io";

export type Callback = <T>(socket: Socket, data: T) => Promise<void>;
export type CallbackOnConnection = (socket: Socket) => Promise<void>;

export interface WSRouter<T> {
  /**
   * create io.on event handler, run callback function inside it,
   * then register event hadlers
   */
  onConnect: (callback?: CallbackOnConnection) => void;
  /**
   * add an event handler
   */
  on: (event: string, callback: Callback) => void;
  /**
   * return events object
   */
  getEvent: (event: string) => Callback | null;
}

export const getWSRouter = <T>(io: Server): WSRouter<T> => {
  // init events object
  const events: { [event: string]: Callback } = {};

  return {
    onConnect: (callback?: CallbackOnConnection) => {
      io.on("connection", async (socket) => {
        // run callback function
        if (callback) {
          try {
            await callback(socket);
          } catch (e) {
            throw e;
          }
        }
        // pick up each key from events object
        // create on event handler and invoke callback inside it
        console.log("about to register");
        Object.keys(events).forEach((key) => {
          socket.on(key, (data: T) => {
            events[key](socket, data);
          });
          console.log(`==== event "${key}" registered ====`);
        });
      });
    },

    on: (event: string, callback: Callback) => {
      // add event handler callback to events object
      events[event] = callback;
    },

    getEvent: (event: string) => (events[event] ? events[event] : null),
  };
};
