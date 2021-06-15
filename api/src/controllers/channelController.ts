import { RequestHandler, Request, Response } from "express";
import Channel from "../models/Channel.model";
import User from "../models/User.model";
import { ChannelQuery } from "../queries/channelQuery";

export interface ChannelController {
  postChannel: RequestHandler;
  getChannel: RequestHandler;
}

export const getChannelController = (params: {
  query: ChannelQuery;
}): ChannelController => {
  return {
    postChannel: async (req: Request, res: Response) => {
      try {
        // validate parameters (channel ID, name, member IDs)
        console.log(req.body);
        if (!req.body) throw new Error("HTTP request has no body");
        const { id, name } = req.body;
        const { userId, username } = req.session;
        if (!(id && name && userId && username)) {
          throw new Error("invalid input");
        }
        // create a new channel
        // return the result
        throw new Error("not implemented");
      } catch (e) {
        res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
        return;
      }
    },

    getChannel: async (req: Request, res: Response) => {
      try {
        const user = await User.findOne({
          include: [Channel],
          where: { id: req.session.userId },
        });
        console.log("user: ", user);

        throw new Error("not implemented");
      } catch (e) {
        res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
        return;
      }
    },
  };
};
