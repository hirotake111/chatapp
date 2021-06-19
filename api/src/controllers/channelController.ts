import { RequestHandler, Request, Response } from "express";
import Channel from "../models/Channel.model";
import User from "../models/User.model";
import { ChannelQuery } from "../queries/channelQuery";
import { RosterQuery } from "../queries/rosterQeury";

export interface ChannelController {
  postChannel: RequestHandler;
  getChannel: RequestHandler;
  getChannelMembers: RequestHandler;
}

export const getChannelController = ({
  channelQuery,
  rosterQuery,
}: {
  channelQuery: ChannelQuery;
  rosterQuery: RosterQuery;
}): ChannelController => {
  return {
    postChannel: async (req: Request, res: Response) => {
      try {
        // validate parameters (channel ID, name, member IDs)
        if (!req.body) throw new Error("HTTP request has no body");
        const { channelId, channelName } = req.body;
        const { userId } = req.session;
        if (!(channelId && channelName && userId)) {
          throw new Error("invalid HTTP body");
        }
        if (!(typeof channelId === "string" && typeof channelName === "string"))
          throw new Error(`either channelId or channelName has invalid type`);

        // create a new channel
        const channel = await channelQuery.createChannel(
          channelId,
          channelName
        );
        if (!channel) {
          res.status(400).send({ error: "channel already exists." });
          return;
        }

        // add requester to channel
        const roster = await rosterQuery.addUserToChannel(channelId, userId);

        // return the result
        res.status(200).send({
          detail: "channel is successfully created",
          channelId,
          channelName,
          createdAt: channel.createdAt,
          member: {
            userId,
            joinedAt: roster.joinedAt,
          },
        });
        return;
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

        if (!user) throw new Error("user not found on database");
        const { id, username, displayName, firstName, lastName, channels } =
          user;
        res.status(200).send({
          user: {
            id,
            username,
            displayName,
            firstName,
            lastName,
            channels: channels.map(({ id, name }) => ({ id, name })),
          },
        });
        return;
      } catch (e) {
        res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
        return;
      }
    },

    /**
     *
     * @param req TODO
     * @param res
     * @returns
     */
    getChannelMembers: async (req: Request, res: Response) => {
      try {
        throw new Error("getChannelMembers not implemented");
        // validate if the requester belongs to the channel
        // fetch channel members
        // respond
      } catch (e) {
        res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
        return;
      }
    },
  };
};
