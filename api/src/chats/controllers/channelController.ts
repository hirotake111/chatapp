import { RequestHandler, Request, Response, NextFunction } from "express";
import { validate, v4 as uuid } from "uuid";
import { ChatConfigType } from "../config";
import Channel from "../models/Channel.model";

import { Queries } from "../queries/query";
import { getCheckMember } from "./utils";

export interface ChannelController {
  getMyChannels: RequestHandler;
  createNewChannel: RequestHandler;
  getChannelDetail: RequestHandler;
  getChannelDetailWithMessages: RequestHandler;
  updateChannel: RequestHandler;
  deleteChannel: RequestHandler;
  getChannelMembers: RequestHandler;
}

export const getChannelController = (
  config: ChatConfigType,
  queries: Queries
): ChannelController => {
  const { userQuery, channelQuery } = queries;
  const checkMember = getCheckMember(userQuery);
  return {
    createNewChannel: async (req: Request, res: Response) => {
      // if request doesn't have body, throw an error => HTTP 500
      if (!req.body)
        return res.status(400).send({ detail: "HTTP request has no body" });
      const { channelName, memberIds } = req.body;
      const { userId, username } = req.session;
      // validate channel name
      if (!(typeof channelName === "string"))
        return res.status(400).send({ detail: "invalid channel name" });
      // validate members
      if (!Array.isArray(memberIds))
        return res.status(400).send({
          detail: "members parameter is not an array of string",
        });
      if (
        !(
          memberIds.length > 0 &&
          typeof memberIds[0] === "string" &&
          validate(memberIds[0])
        )
      )
        return res.status(400).send({ detail: "invalid type of member IDs" });
      // generate channel ID
      const channelId = uuid();
      try {
        const event: ChannelCreatedEvent = {
          type: "ChannelCreated",
          metadata: {
            traceId: uuid(),
            timestamp: Date.now(),
          },
          payload: {
            channelId,
            channelName,
            sender: {
              id: userId,
              name: username,
            },
            memberIds,
          },
        };
        await config.kafka.producer.send({
          topic: "chat",
          messages: [{ value: JSON.stringify(event) }],
        });
        return res.status(200).send({
          detail: "success",
          channelId,
          channelName,
          members: [userId, ...memberIds],
        });
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
        const channels = (await Promise.all(
          (
            await channelQuery.getChannelsByUserId(requesterId)
          ).map((ch) => channelQuery.getChannelById(ch.id))
        )) as Channel[];
        // return it
        return res.status(200).send({
          detail: "success",
          channels: channels.map((ch) => ({
            id: ch.id,
            name: ch.name,
            createdAt: ch.createdAt.getTime(),
            updatedAt: ch.updatedAt.getTime(),
            users: ch.users.map(({ id, username, displayName }) => ({
              id,
              username,
              displayName,
            })),
          })),
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
    getChannelMembers: async (req: Request, res: Response) => {
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
        // check if the requester is a member of the channel
        if (!(await checkMember(channelId, requesterId)))
          return res
            .status(400)
            .send({ detail: "you are not a member of channel" });
        // fetch channel members
        const members = await userQuery.getUsersByChannelId(channelId);
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

    getChannelDetail: async (req: Request, res: Response) => {
      const { channelId } = req.params;
      const { userId: requesterId } = req.session;
      // validate channelId
      if (!validate(channelId))
        return res
          .status(400)
          .send({ detail: `invalid channel ID: ${channelId}` });
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
        if (!(await checkMember(channelId, requesterId)))
          return res
            .status(400)
            .send({ detail: "requester is not a member of channel" });
        return res.status(200).send({
          detail: "success",
          channel: {
            id: channel.id,
            name: channel.name,
            createdAt: channel.createdAt.getTime(),
            updatedAt: channel.updatedAt.getTime(),
            users: channel.users.map(({ id, displayName }) => ({
              id,
              displayName,
            })),
          },
        });
      } catch (e) {
        return res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
      }
    },

    deleteChannel: async (req: Request, res: Response) => {
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
        // check if the requester is a member of channel
        if (!(await checkMember(channelId, requesterId)))
          return res
            .status(400)
            .send({ detail: "requester is not a member of channel" });
        // delete channel
        const event: ChannelDeletedEvent = {
          type: "ChannelDeleted",
          metadata: {
            traceId: uuid(),
            timestamp: Date.now(),
          },
          payload: {
            channelId,
            sender: {
              id: requesterId,
              name: req.session.username,
            },
          },
        };
        await config.kafka.producer.send({
          topic: "chat",
          messages: [{ value: JSON.stringify(event) }],
        });
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
      const { userId: requesterId, username } = req.session;
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
        if (!(await checkMember(channelId, requesterId)))
          return res
            .status(400)
            .send({ detail: "you are not a member of channel" });
        const event: ChannelUpdatedEvent = {
          type: "ChannelUpdated",
          metadata: {
            traceId: uuid(),
            timestamp: Date.now(),
          },
          payload: {
            channelId,
            newChannelName: channelName,
            sender: {
              id: requesterId,
              name: username,
            },
          },
        };
        await config.kafka.producer.send({
          topic: "chat",
          messages: [{ value: JSON.stringify(event) }],
        });

        return res
          .status(200)
          .send({ detail: "success", id: channelId, name: channelName });
      } catch (e) {
        return res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
      }
    },

    getChannelDetailWithMessages: async (req: Request, res: Response) => {
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
        if (!(await checkMember(channelId, requesterId)))
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
