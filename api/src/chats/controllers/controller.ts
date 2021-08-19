import { Request, RequestHandler, Response } from "express";

import { ChatConfigType } from "../config";
import { getUserController, UserController } from "./userController";
import { Queries } from "../queries/query";
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
  config: ChatConfigType,
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
    user: getUserController(config, queries),
    // channel controler
    channel: getChannelController(config, queries),
    // roster controller
    roster: getRosterContoller(config, queries),
    // message controller
    message: getMessageController(config, queries),
  };
};
