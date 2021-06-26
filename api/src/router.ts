import { Router } from "express";
import { RootController } from "./controllers/controller";
import { authenticateUser, setNoCache } from "./middleware";

export const useRoute = (controller: RootController) => {
  const router = Router();

  router.get("/", controller.getRoot);

  // OIDC endpoints
  router.get("/login", setNoCache, controller.user.getLogin);

  router.get("/callback", setNoCache, controller.user.getCallback);

  // users endpoint
  router.get(
    "/api/user",
    setNoCache,
    authenticateUser,
    controller.user.getUsers
  );

  router.get(
    "/api/user/me",
    setNoCache,
    authenticateUser,
    controller.user.getUserInfo
  );

  /**
   * channel endpoints
   */
  router.get(
    "/api/channel",
    authenticateUser,
    controller.channel.getMyChannels
  );

  router.post(
    "/api/channel/",
    setNoCache,
    authenticateUser,
    controller.channel.createNewChannel
  );

  router.get(
    "/api/channel/:channelId",
    authenticateUser,
    controller.channel.getChannelDetail
  );

  router.put(
    "/api/channel/:channelId",
    authenticateUser,
    controller.channel.updateChannel
  );

  router.delete(
    "/api/channel/:channelId",
    authenticateUser,
    controller.channel.deleteChannel
  );

  /**
   * channel member endpoints
   */

  router.get(
    "/api/channel/:channelId/member",
    setNoCache,
    authenticateUser,
    controller.channel.getChannelMembers
  );

  router.post(
    "/api/channel/:channelId/member",
    authenticateUser,
    controller.roster.addChannelMember
  );

  router.delete(
    "/api/channel/:channelId/member",
    authenticateUser,
    controller.roster.removeChannelMember
  );

  /**
   * message endpoints
   */
  // get messages from channel
  router.get(
    "/api/channel/:channelId/message",
    authenticateUser,
    // controller.message.getMessagesInChannel
    controller.channel.getChannelDetailWithMessages
  );
  // get one message from channel
  router.get(
    "/api/channel/:channelId/message/:messageId",
    authenticateUser,
    controller.message.getSpecificMessageInChannel
  );
  // post a message to channel
  router.post(
    "/api/channel/:channelId/message",
    authenticateUser,
    controller.message.postMessage
  );
  // edit a message in channel
  router.put(
    "/api/channel/:channelId/message/:messageId",
    authenticateUser,
    controller.message.editMessage
  );
  // delete a message in channel
  router.delete(
    "/api/channel/:channelId/message/:messageid",
    authenticateUser,
    controller.message.deleteMessage
  );

  return router;
};
