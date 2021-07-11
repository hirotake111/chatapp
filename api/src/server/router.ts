import { Router } from "express";

import { RootController } from "../chats/controllers/controller";
import { getChatRouter } from "../chats/router";

export const getRouter = ({
  user,
  channel,
  message,
  roster,
  getRoot,
}: RootController) => {
  const router = Router();
  router.use(getChatRouter({ user, channel, roster, message }));

  router.get("/", getRoot);

  return router;
};
