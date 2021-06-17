import { RequestHandler, Request, Response, query } from "express";
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
        const {
          id,
          name,
          participants,
        }: {
          id: string;
          name: string;
          participants?: string | string[];
        } = req.body;
        const { userId: requesterId } = req.session;
        if (!(id && name && requesterId)) {
          throw new Error("invalid HTTP body");
        }

        // create members array
        const members =
          participants === undefined
            ? []
            : typeof participants === "string"
            ? [participants]
            : participants;
        members.push(requesterId);

        // create a new channel
        const channel = await channelQuery.createChannel(id, name);
        if (!channel) {
          res.status(400).send({ error: "channel already exists." });
          return;
        }

        // add other participatns to channel
        const rosters = await Promise.all(
          members.map(async (member) =>
            rosterQuery.addUserToChannel({
              channelId: id,
              userId: member,
            })
          )
        );

        // return the result
        res.status(200).send({
          result: {
            channelId: channel.id,
            name: channel.name,
            createdAt: channel.createdAt,
            members: rosters.map((r) => ({
              userId: r.userId,
              joinedAt: r.joinedAt,
            })),
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
