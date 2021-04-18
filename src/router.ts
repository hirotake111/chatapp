import { Router } from "express";
import { RootController } from "./controllers/controller";
import { setNoCache } from "./middleware";

export const useRoute = (controller: RootController) => {
  const router = Router();

  router.get("/", controller.getRoot);

  router.get("/userinfo", setNoCache, controller.getUserinfo);

  router.get("/login", setNoCache, controller.user.getLogin);

  router.get("/callback", setNoCache, controller.user.getCallback);

  return router;
};
