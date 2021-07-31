import { Server, Socket } from "socket.io";
import { v4 as uuid } from "uuid";
import { ChatConfigType } from "../config";
import { Queries } from "../queries/query";

import { getCheckMember } from "./utils";
import { validateMessage } from "../../utils/utils";

export const sendExceptionToSender = (
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

export const getWSController = (
  config: ChatConfigType,
  { channelQuery, userQuery, messageQuery }: Queries
): WSController => {
  const checkMember = getCheckMember(userQuery);
  return {
    onConnection: async (io: Server, socket: Socket) => {
      // validate user
      const { userId, username } = socket.request.session;
      if (!userId || !username) throw new Error("user is not authenticated");
      // console.log(`==== WEBSOCKET CONNECTED ${username} (${userId}) ====`);

      try {
        // get channel IDs
        const channelIds = (await channelQuery.getChannelsByUserId(userId)).map(
          (channel) => channel.id
        );
        // join room(s)
        // console.log("Joining channel IDs: ", channelIds);
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

    onChatMessage: async (io: Server, socket: Socket, data: Message) => {
      // validate user
      const { userId, username } = socket.request.session;
      if (!username || !userId)
        return sendExceptionToSender(socket, {
          code: 400,
          detail: "Not authenticated",
          timestamp: Date.now(),
        });
      // validate payload
      if (!validateMessage(data))
        return sendExceptionToSender(socket, {
          code: 400,
          detail: "ivalid payload",
          timestamp: Date.now(),
        });
      const { sender, channelId, id, content } = data;
      // sender and authenticated user must be the same
      if (username !== sender.name || userId !== sender.id)
        return sendExceptionToSender(socket, {
          code: 400, // bad request
          detail: "invalid username or user id",
          timestamp: Date.now(),
        });
      try {
        // sender must be a member of channel
        if (!(await checkMember(channelId, sender.id)))
          return sendExceptionToSender(socket, {
            code: 400, // bad request
            detail: "invalid username or user id",
            timestamp: Date.now(),
          });
        // if database has the message in it, then send update event
        // else, send create event
        const result = await messageQuery.getSpecificMessage(id, channelId);
        const event: MessageEvents = result
          ? {
              type: "MessageUpdated",
              metadata: { traceId: uuid(), timestamp: Date.now() },
              payload: {
                channelId: uuid(),
                messageId: id,
                sender,
                content,
              },
            }
          : {
              type: "MessageCreated",
              metadata: { traceId: uuid(), timestamp: Date.now() },
              payload: { channelId, messageId: id, sender, content },
            };
        await config.kafka.producer.send({
          topic: "chat",
          messages: [{ value: JSON.stringify(event) }],
        });
      } catch (e) {
        return sendExceptionToSender(socket, {
          code: 500,
          detail: e.message,
          timestamp: Date.now(),
        });
      }
      // send members the message
      io.to(channelId).emit("chat message", data);
      // socket.to(chat.channelId).emit("socket to chat message", chat);
    },

    onException: async (io: Server, socket: Socket, data: any) => {
      // close the underlying connection
      // console.log("socket will close and received data: ", data);
      socket.disconnect(true);
    },
  };
};
