import { Router } from "express";
import { Server } from "socket.io";

import { getWSRouter } from "../utils/wsRouter";
import { setNoCache, authenticateUser } from "../utils/middleware";
import { ChannelController } from "./controllers/channelController";
import { RosterController } from "./controllers/rosterController";
import { MessageController } from "./controllers/messageController";
import { WSController } from "./controllers/wsController";
import { UserController } from "./controllers/userController";

export const getChatRouter = ({
  user,
  channel,
  roster,
  message,
}: {
  user: UserController;
  channel: ChannelController;
  roster: RosterController;
  message: MessageController;
}) => {
  const router = Router();

  /**
   * user endpoints
   */
  // login endpoints
  router.get("/login", setNoCache, user.getLogin);
  // callback endpoints
  router.get("/callback", setNoCache, user.getCallback);
  // users endpoint
  router.get("/api/user", setNoCache, authenticateUser, user.getUsers);
  // userinfo endpoint
  router.get("/api/user/me", setNoCache, authenticateUser, user.getUserInfo);

  /**
   * channel endpoints
   */
  router.get("/api/channel", authenticateUser, channel.getMyChannels);

  router.post(
    "/api/channel/",
    setNoCache,
    authenticateUser,
    channel.createNewChannel
  );

  router.get(
    "/api/channel/:channelId",
    authenticateUser,
    channel.getChannelDetail
  );

  router.put(
    "/api/channel/:channelId",
    authenticateUser,
    channel.updateChannel
  );

  router.delete(
    "/api/channel/:channelId",
    authenticateUser,
    channel.deleteChannel
  );

  /**
   * channel member endpoints
   */

  router.get(
    "/api/channel/:channelId/member",
    setNoCache,
    authenticateUser,
    channel.getChannelMembers
  );

  router.post(
    "/api/channel/:channelId/member",
    authenticateUser,
    roster.addChannelMember
  );

  router.delete(
    "/api/channel/:channelId/member",
    authenticateUser,
    roster.removeChannelMember
  );

  /**
   * message endpoints
   */
  // get messages from channel
  router.get(
    "/api/channel/:channelId/message",
    authenticateUser,
    // message.getMessagesInChannel
    message.getMessagesInChannel
  );
  // get one message from channel
  router.get(
    "/api/channel/:channelId/message/:messageId",
    authenticateUser,
    message.getSpecificMessageInChannel
  );
  // post a message to channel
  router.post(
    "/api/channel/:channelId/message",
    authenticateUser,
    message.postMessage
  );
  // edit a message in channel
  router.put(
    "/api/channel/:channelId/message/:messageId",
    authenticateUser,
    message.editMessage
  );
  // delete a message in channel
  router.delete(
    "/api/channel/:channelId/message/:messageId",
    authenticateUser,
    message.deleteMessage
  );

  return router;
};

export const useWebSocketRoute = (io: Server, controller: WSController) => {
  const wsRouter = getWSRouter(io);
  wsRouter.onConnect(controller.onConnection);
  wsRouter.on("chat message", controller.onChatMessage);
  wsRouter.on("disconnect", controller.onDiscconect);
  wsRouter.on("reconnect", controller.onReconnect);
};
