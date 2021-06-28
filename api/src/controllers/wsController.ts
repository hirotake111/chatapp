import { Socket } from "socket.io";

import { Queries } from "../queries";

export interface WSController {
  /**
   * connection event handler
   */
  onConnection: (socket: Socket) => Promise<void>;
  /**
   * disconnect event handler
   */
  onDiscconect: (socket: Socket, message: ChatMessage) => Promise<void>;
  /*
   * chat message event handler
   */
  onChatMessage: (socket: Socket, message: ChatMessage) => Promise<void>;
}

export const getWSController = (queries: Queries): WSController => {
  return {
    onConnection: async (socket: Socket) => {
      console.log("==== WEBSOCKET CONNECTED!!!! ===");
      // validate user
      const { userId, username } = socket.request.session;
      if (!userId || !username) {
        console.log("user is not authenticated");
        socket.disconnect(true);
        return;
      }
      console.log(`authenticateduser: ${username} (${userId})`);

      try {
        // get channel information
        const channels = await queries.channelQuery.getChannelsByUserId(userId);
        // join room(s)
        const ids = channels.map((ch) => ch.id);
        console.log("Joining channel IDs: ", ids);
        socket.join(ids);
      } catch (e) {
        throw e;
      }
    },

    onDiscconect: async (socket: Socket, message: ChatMessage) => {
      console.log("client disconnected with data: ", message);
    },

    onChatMessage: async (socket: Socket, message: ChatMessage) => {
      console.log("Received message: ", message);
      console.log("socket.handshake.auth: ", socket.handshake.auth);
      const { userId, username } = socket.request.session;
      if (!username || !userId) {
        socket.emit("chat message", {
          timestamp: Date.now(),
          content: "Not Authenticated",
        });
        return;
      }
      // check if authenticated user and sender info in payload is the same
      if (
        username !== message.sender.username ||
        userId !== message.sender.userId
      ) {
        socket.emit("chat message", {
          ...message,
          error: {
            code: 400, // bad request
            reason: "invalid username or user id",
          },
        } as ChatMessage);
      }
      // send members the message
      socket.to(message.channelId).emit("chat message", message);
      // socket.emit("chat message", message);
    },
  };
};
