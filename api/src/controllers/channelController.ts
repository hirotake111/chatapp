import { RequestHandler, Request, Response, NextFunction } from "express";
import { validate } from "uuid";

import { ChannelQuery } from "../queries/channelQuery";
import { RosterQuery } from "../queries/rosterQuery";
import { UserQuery } from "../queries/userQuery";

export interface ChannelController {
  postChannel: RequestHandler;
  getChannel: RequestHandler;
  getChannelDetail: RequestHandler;
  getChannelMembers: RequestHandler;
  deleteChannel: RequestHandler;
}

export const getChannelController = ({
  channelQuery,
  rosterQuery,
  userQuery,
}: {
  channelQuery: ChannelQuery;
  rosterQuery: RosterQuery;
  userQuery: UserQuery;
}): ChannelController => {
  return {
    postChannel: async (req: Request, res: Response) => {
      try {
        // if request doesn't have body, throw an error => HTTP 500
        if (!req.body) throw new Error("HTTP request has no body");
        // validate parameters (channel ID, name, member IDs)
        const { channelId, channelName } = req.body;
        const { userId } = req.session;
        if (!(channelId && channelName && userId)) {
          throw new Error("invalid HTTP body");
        }
        if (!(validate(channelId) && typeof channelName === "string"))
          throw new Error(`either channelId or channelName has invalid type`);

        // create a new channel
        const channel = await channelQuery.createChannel(
          channelId,
          channelName
        );

        if (!channel) {
          res
            .status(400)
            .send({ error: "bad request", detail: "channel already exists" });
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
        const channels = await channelQuery.getChannelsByUserId(
          req.session.userId
        );

        res.status(200).send({
          detail: "success",
          channels: channels.map(({ id, name }) => ({ id, name })),
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
        const { channelId } = req.params;
        const { userId } = req.session;
        // validate channelId
        if (!validate(channelId)) {
          res.status(400).send({
            detail: `invalid channel ID: ${channelId}`,
          });
          return;
        }
        // validate userId
        if (!validate(userId)) {
          res.status(400).send({ detail: `invalid user ID: ${userId}` });
        }
        // fetch channel members
        const members = await userQuery.getUsersByChannelId(channelId);
        // check if the requester is a member of the channel
        // respond
        res.status(200).send({
          detail: "success",
          members,
        });
        return;
      } catch (e) {
        res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
        return;
      }
    },

    getChannelDetail: async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      const { channelId } = req.params;
      const { userId } = req.session;
      // validate channelId
      if (!validate(channelId)) {
        res.status(400).send({
          detail: `invalid channel ID: ${channelId}`,
        });
        return;
      }
      // validate userId
      if (!validate(userId)) {
        res.status(400).send({ detail: `invalid user ID: ${userId}` });
      }
      try {
        // check if the requester is a member of the channel
        const members = await userQuery.getUsersByChannelId(channelId);
        if (!members.map((member) => member.id).includes(userId))
          return res
            .status(400)
            .send({ detail: "requester is not a member of channel" });
        // fetch channel details
        const channel = await channelQuery.getChannelById(channelId);
        // respond
        if (channel)
          return res.status(200).send({
            detail: "success",
            channel: {
              id: channel.id,
              name: channel.name,
              cratedAt: channel.createdAt,
              updatedAt: channel.updatedAt,
            },
          });
        return res.status(400).send({ detail: "channel doesn't exist" });
      } catch (e) {
        return res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
      }
    },

    deleteChannel: async (req: Request, res: Response, next: NextFunction) => {
      try {
        throw new Error("not implemented");
      } catch (e) {
        return res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
      }
    },
  };
};
