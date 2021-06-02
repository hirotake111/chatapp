import { Request, RequestHandler, Response } from "express";
// import { Client, generators as Generators } from "openid-client";

import { ConfigType } from "../config";
// import { ControllerSignature } from "../type";
import { getUserController, UserController } from "./userController";
import { Services } from "../services/";

export type RootController = {
  getRoot: RequestHandler;
  getUserinfo: RequestHandler;
  user: UserController;
};

export const getController = (
  config: ConfigType,
  services: Services
): RootController => {
  return {
    getRoot: (req: Request, res: Response) => {
      res.status(200).send({ message: "OK" });
      return;
    },

    getUserinfo: (req: Request, res: Response) => {
      const { userId, username } = req.session;
      if (!username) {
        // UNAUTHORIZED response
        return res
          .status(401)
          .send({ mesaage: "UNAUTHORIZED", location: "/login" });
      }
      return res.status(200).send({ userId, username });
    },

    // user controller
    user: getUserController({
      oidcClient: config.oidc.client,
      generators: config.oidc.generators,
      userService: services.userService,
      config,
    }),
  };
};
