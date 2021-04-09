import { Router } from "express";
import { ControllerReturnType } from "./controllers/controller";
import { setNoCache } from "./middleware";

export const useRoute = (controller: ControllerReturnType) => {
  const router = Router();

  router.get("/", controller.getRoot);

  router.get("/userinfo", setNoCache, controller.getUserinfo);
  // router.get("/userinfo", (req, res) => res.send("userinfo"));

  router.get("/login", setNoCache, controller.user.getLogin);
  // router.get("/login", (req, res) => res.send("OK"));

  router.get("/callback", setNoCache, controller.user.getCallback);
  return router;
};
