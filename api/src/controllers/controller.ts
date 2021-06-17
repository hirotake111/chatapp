import { Request, RequestHandler, Response } from "express";
// import { Client, generators as Generators } from "openid-client";

import { ConfigType } from "../config";
// import { ControllerSignature } from "../type";
import { getUserController, UserController } from "./userController";
import { Services } from "../queries";
import { ChannelController, getChannelController } from "./channelController";

export type RootController = {
  getRoot: RequestHandler;
  getUserinfo: RequestHandler;
  user: UserController;
  channel: ChannelController;
};

export const getController = (
  config: ConfigType,
  services: Services
): RootController => {
  const { channelQuery, rosterQuery } = services;
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

    // channel controler
    channel: getChannelController({ channelQuery, rosterQuery }),
  };
};
