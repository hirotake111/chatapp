import { Request, RequestHandler, Response } from "express";
// import { Client, generators as Generators } from "openid-client";

import { ConfigType } from "../config";
// import { ControllerSignature } from "../type";
import { getUserController, UserController } from "./userController";
import { Queries } from "../queries";
import { ChannelController, getChannelController } from "./channelController";
import { getRosterContoller, RosterController } from "./rosterController";
import { getMessageController, MessageController } from "./messageController";

export type RootController = {
  getRoot: RequestHandler;
  getUserinfo: RequestHandler;
  user: UserController;
  channel: ChannelController;
  roster: RosterController;
  message: MessageController;
};

export const getController = (
  config: ConfigType,
  queries: Queries
): RootController => {
  const { channelQuery, rosterQuery, userQuery, messageQuery } = queries;
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
      userQuery: queries.userQuery,
      config,
    }),
    // channel controler
    channel: getChannelController({ channelQuery, rosterQuery, userQuery }),
    // roster controller
    roster: getRosterContoller({ rosterQuery, userQuery }),
    // message controller
    message: getMessageController({ messageQuery, userQuery }),
  };
};
