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

  // Channel Endpoints
  router.post(
    "/api/channels",
    setNoCache,
    authenticateUser,
    controller.channel.postChannel
  );

  router.post(
    "/api/channels/:channelId",
    authenticateUser,
    controller.roster.addChannelMember
  );

  router.delete(
    "/api/channels/:channelId",
    authenticateUser,
    controller.roster.removeChannelMember
  );

  router.get(
    "/api/channels",
    setNoCache,
    authenticateUser,
    controller.channel.getChannelMembers
  );

  // for testing purpose
  router.get(
    "/api/users/me/v2",
    authenticateUser,
    controller.channel.getChannel
  );

  return router;
};
