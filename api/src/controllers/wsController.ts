import { Server, Socket } from "socket.io";

import { Queries } from "../queries";

/**
 * return ChatPayload, or null if invalid
 */
const validateChatPayload = (data: any): ChatPayload | null => {
  const {
    sender: { username, id },
    timestamp,
    channelId,
    messageId,
    content,
  } = data;
  return username &&
    typeof username === "string" &&
    id &&
    typeof id === "string" &&
    timestamp &&
    typeof timestamp === "number" &&
    channelId &&
    typeof channelId === "string" &&
    channelId &&
    typeof messageId === "string" &&
    content &&
    typeof content === "string"
    ? {
        sender: { username, id },
        timestamp,
        channelId,
        messageId,
        content,
      }
    : null;
};

const sendExceptionToSender = (
  socket: Socket,
  payload: ExceptionPayload
): void => {
  // send exception event to sender
  socket.emit("exception", payload);
};

export interface WSController {
  /**
   * connection event handler.
   * If not authenticated, throw an error
   */
  onConnection: (io: Server, socket: Socket) => Promise<void>;
  /**
   * disconnect event handler
   */
  onDiscconect: (io: Server, socket: Socket, data: any) => Promise<void>;
  /**
   * reconnect event handler
   */
  onReconnect: (io: Server, socket: Socket, data: any) => Promise<void>;
  /*
   * chat message event handler
   */
  onChatMessage: (io: Server, socket: Socket, data: any) => Promise<void>;
  /**
   * event handler to handle error message from client
   */
  onException: (io: Server, socket: Socket, data: any) => Promise<void>;
}

export const getWSController = (queries: Queries): WSController => {
  return {
    onConnection: async (io: Server, socket: Socket) => {
      // validate user
      const { userId, username } = socket.request.session;
      if (!userId || !username) throw new Error("user is not authenticated");
      console.log(`==== WEBSOCKET CONNECTED ${username} (${userId}) ====`);

      try {
        // get channel IDs
        const channelIds = (
          await queries.channelQuery.getChannelsByUserId(userId)
        ).map((channel) => channel.id);
        // join room(s)
        console.log("Joining channel IDs: ", channelIds);
        socket.join(channelIds);
      } catch (e) {
        throw e;
      }
    },

    onDiscconect: async (io: Server, socket: Socket, data: any) => {
      console.log("client disconnected with data: ", data);
    },

    onReconnect: async (io: Server, socket: Socket, data: any) => {
      console.log(`user ${socket.handshake} reconnected`);
    },

    onChatMessage: async (io: Server, socket: Socket, data: any) => {
      // console.log("Received message: ", data);
      // console.log("socket.handshake.auth: ", socket.handshake.auth);
      // validate user
      const { userId, username } = socket.request.session;
      if (!username || !userId)
        return sendExceptionToSender(socket, {
          code: 400,
          detail: "Not authenticated",
          timestamp: Date.now(),
        });
      // validate payload
      const chat = validateChatPayload(data);
      if (!chat)
        return sendExceptionToSender(socket, {
          code: 400,
          detail: "ivalid payload",
          timestamp: Date.now(),
        });
      // sender and authenticated user must be the same
      if (username !== chat.sender.username || userId !== chat.sender.id)
        return sendExceptionToSender(socket, {
          code: 400, // bad request
          detail: "invalid username or user id",
          timestamp: Date.now(),
        });
      // send members the message
      io.to(chat.channelId).emit("chat message", chat);
      // socket.to(chat.channelId).emit("socket to chat message", chat);
    },

    onException: async (io: Server, socket: Socket, data: any) => {
      // close the underlying connection
      console.log("socket will close and received data: ", data);
      socket.disconnect(true);
    },
  };
};
