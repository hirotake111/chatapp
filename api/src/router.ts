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
    "/api/users",
    setNoCache,
    authenticateUser,
    controller.user.getUsers
  );

  router.get(
    "/api/users/me",
    setNoCache,
    authenticateUser,
    controller.user.getUserInfo
  );

  /**
   * channels endpoints
   */
  router.get(
    "/api/channels",
    authenticateUser,
    controller.channel.getMyChannels
  );

  router.get(
    "/api/channels/:channelId",
    authenticateUser,
    controller.channel.getChannelDetail
  );

  router.post(
    "/api/channels/:channelId",
    setNoCache,
    authenticateUser,
    controller.channel.createNewChannel
  );

  router.put(
    "/api/channels/:channelId",
    authenticateUser,
    controller.channel.updateChannel
  );

  router.delete(
    "/api/channels/:channelId",
    authenticateUser,
    controller.channel.deleteChannel
  );

  /**
   * channel members endpoints
   */

  router.get(
    "/api/channels/:channelId/members",
    setNoCache,
    authenticateUser,
    controller.channel.getChannelMembers
  );

  router.post(
    "/api/channels/:channelId/members",
    authenticateUser,
    controller.roster.addChannelMember
  );

  router.delete(
    "/api/channels/:channelId/members",
    authenticateUser,
    controller.roster.removeChannelMember
  );

  return router;
};
