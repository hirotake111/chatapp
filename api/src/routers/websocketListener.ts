import { RequestHandler, Request, NextFunction } from "express";
import { Server } from "socket.io";

import { Queries } from "../queries";

export const addWebSocketEventListener = async (
  io: Server,
  queries: Queries,
  session: RequestHandler
) => {
  // session for WebSocket
  io.use((socket, next) => {
    const request = socket.request as Request;
    session(request, request.res!, next as NextFunction);
  });

  // Websocket listener
  io.on("connection", async (socket) => {
    console.log("==== WEBSOCKET CONNECTED ===");
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

    // handler for disconnection
    socket.on("disconnect", (data) => {
      console.log("client disconnected with data: ", data);
    });

    // message handler
    socket.on("chat message", (message: ChatMessage) => {
      console.log("Received message: ", message);
      // const { username, userId } = socket.request.session;
      console.log("socket.handshake.auth: ", socket.handshake.auth);
      // check if user is authenticated
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
    });
  });
};
