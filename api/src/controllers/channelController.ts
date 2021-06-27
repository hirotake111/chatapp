import { RequestHandler, Request, Response, NextFunction } from "express";
import { validate, v4 as uuid } from "uuid";

import { ChannelQuery } from "../queries/channelQuery";
import { RosterQuery } from "../queries/rosterQuery";
import { UserQuery } from "../queries/userQuery";

export interface ChannelController {
  getMyChannels: RequestHandler;
  createNewChannel: RequestHandler;
  getChannelDetail: RequestHandler;
  getChannelDetailWithMessages: RequestHandler;
  updateChannel: RequestHandler;
  deleteChannel: RequestHandler;
  getChannelMembers: RequestHandler;
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
    createNewChannel: async (req: Request, res: Response) => {
      // if request doesn't have body, throw an error => HTTP 500
      if (!req.body)
        return res.status(400).send({ detail: "HTTP request has no body" });
      const { channelName } = req.body;
      const { userId } = req.session;
      // validate channel name
      if (!(typeof channelName === "string"))
        return res.status(400).send({ detail: "invalid channel name" });
      // generate channel ID
      const channelId = uuid();
      try {
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

    getMyChannels: async (req: Request, res: Response) => {
      const requesterId = req.session.userId;
      // validate requester ID
      if (!validate(requesterId))
        return res.status(400).send({ detail: "invalid requester ID" });
      try {
        // get channels by requester ID
        const channels = await channelQuery.getChannelsByUserId(requesterId);
        // return it
        return res.status(200).send({
          detail: "success",
          channels: channels.map(({ id, name }) => ({ id, name })),
        });
      } catch (e) {
        return res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
      }
    },

    /**
     * getChannelMembers returns an array of user ID and name
     */
    getChannelMembers: async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        const { channelId } = req.params;
        const { userId: requesterId } = req.session;
        // validate channelId
        if (!validate(channelId))
          return res.status(400).send({
            detail: `invalid channel ID: ${channelId}`,
          });
        // validate userId
        if (!validate(requesterId))
          return res
            .status(400)
            .send({ detail: `invalid requester ID: ${requesterId}` });

        // fetch channel members
        const members = await userQuery.getUsersByChannelId(channelId);
        // check if the requester is a member of the channel
        // respond
        return res.status(200).send({
          detail: "success",
          members: members.map((m) => ({
            id: m.id,
            username: m.username,
            displayName: m.displayName,
            firstName: m.firstName,
            lastName: m.lastName,
          })),
        });
      } catch (e) {
        return res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
      }
    },

    getChannelDetail: async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      const { channelId } = req.params;
      const { userId: requesterId } = req.session;
      // validate channelId
      if (!validate(channelId)) {
        return res
          .status(400)
          .send({ detail: `invalid channel ID: ${channelId}` });
      }
      // validate userId
      if (!validate(requesterId)) {
        return res
          .status(400)
          .send({ detail: `invalid requester ID: ${requesterId}` });
      }
      try {
        // fetch channel details
        const channel = await channelQuery.getChannelById(channelId);
        if (!channel)
          return res.status(400).send({ detail: "channel doesn't exist" });
        // check if the requester is a member of the channel
        const members = await userQuery.getUsersByChannelId(channelId);
        if (!members.map((member) => member.id).includes(requesterId))
          return res
            .status(400)
            .send({ detail: "requester is not a member of channel" });
        return res.status(200).send({
          detail: "success",
          channel: {
            id: channel.id,
            name: channel.name,
            cratedAt: channel.createdAt,
            updatedAt: channel.updatedAt,
          },
        });
      } catch (e) {
        return res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
      }
    },

    deleteChannel: async (req: Request, res: Response, next: NextFunction) => {
      const { channelId } = req.params;
      const { userId: requesterId } = req.session;
      // validate channelId
      if (!validate(channelId))
        return res
          .status(400)
          .send({ detail: `invalid channel ID: ${channelId}` });
      // validate requesterId
      if (!validate(requesterId))
        return res.status(400).send({ detail: "invalid requester ID" });
      try {
        // fetch channel members
        // check if the requester is a member of channel
        const members = await userQuery.getUsersByChannelId(channelId);
        if (!members.map((member) => member.id).includes(requesterId))
          return res
            .status(400)
            .send({ detail: "requester is not a member of channel" });
        // delete channel
        await channelQuery.deleteChannelById(channelId);
        return res.status(204).send({ detail: "success" });
      } catch (e) {
        if (e.message === `channel ID ${channelId} doesn't exist`) {
          return res.status(400).send({ detail: e.message });
        }
        return res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
      }
    },

    updateChannel: async (req: Request, res: Response, next: NextFunction) => {
      const { userId: requesterId } = req.session;
      const { channelId } = req.params;
      const { channelName } = req.body;
      // validate requesterId
      if (!validate(requesterId))
        return res.status(400).send({ detail: "invalid requester ID" });
      // validate channelId
      if (!validate(channelId))
        return res
          .status(400)
          .send({ detail: `invalid channel ID: ${channelId}` });
      // validate channelName
      if (!(typeof channelName === "string"))
        return res.status(400).send({ detail: "invalid channel name" });
      try {
        // check if the requester is a member of the channel
        // upcate the channel
        const channel = await channelQuery.updateChannelbyId(
          channelId,
          channelName
        );
        // if channel is null, then respond HTTP 400
        if (!channel)
          return res
            .status(400)
            .send({ detail: "unable to update channel with given parameters" });
        return res
          .status(200)
          .send({ detail: "success", id: channelId, name: channelName });
      } catch (e) {
        return res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
      }
    },

    getChannelDetailWithMessages: async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      const { channelId } = req.params;
      const { userId: requesterId } = req.session;
      // validate channelId
      if (!validate(channelId)) {
        return res
          .status(400)
          .send({ detail: `invalid channel ID: ${channelId}` });
      }
      // validate userId
      if (!validate(requesterId)) {
        return res
          .status(400)
          .send({ detail: `invalid requester ID: ${requesterId}` });
      }
      try {
        // fetch channel details
        const channel = await channelQuery.getChannelByChannelIdWithMessages(
          channelId
        );
        if (!channel)
          return res
            .status(400)
            .send({ detail: `channel doesn't exist: ${channelId}` });
        // check if the requester is a member of the channel
        const members = await userQuery.getUsersByChannelId(channelId);
        if (!members.map((member) => member.id).includes(requesterId))
          return res
            .status(400)
            .send({ detail: "requester is not a member of channel" });
        return res.status(200).send({
          detail: "success",
          channel: {
            id: channel.id,
            name: channel.name,
            createdAt: channel.createdAt,
            updatedAt: channel.updatedAt,
            messages: channel.messages,
          },
        });
      } catch (e) {
        return res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
      }
    },
  };
};
