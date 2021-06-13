import { Router } from "express";
import { RootController } from "./controllers/controller";
import { setNoCache } from "./middleware";

export const useRoute = (controller: RootController) => {
  const router = Router();

  router.get("/", controller.getRoot);

  router.get("/users", setNoCache, (req, res) => {
    res.json({
      users: [
        { id: "aaa-aaa-aaa-aaa", username: "otheruser1" },
        { id: "aaa-aaa-aaa-aab", username: "otheruser2" },
      ],
    });
  });
  router.get("/users/me", setNoCache, controller.getUserinfo);

  router.get("/login", setNoCache, controller.user.getLogin);

  router.get("/callback", setNoCache, controller.user.getCallback);

  return router;
};
