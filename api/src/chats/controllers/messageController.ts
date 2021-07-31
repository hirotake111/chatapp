import { RequestHandler, Request, Response, NextFunction } from "express";
import { UpdatedAt } from "sequelize-typescript";
import { v4 as uuid, validate } from "uuid";
import { ChatConfigType } from "../config";

import { Queries } from "../queries/query";
import { getCheckMember } from "./utils";

export interface MessageController {
  getMessagesInChannel: RequestHandler;
  getSpecificMessageInChannel: RequestHandler;
  postMessage: RequestHandler;
  editMessage: RequestHandler;
  deleteMessage: RequestHandler;
}

export const getMessageController = (
  config: ChatConfigType,
  queries: Queries
): MessageController => {
  const { userQuery, messageQuery, channelQuery } = queries;
  const checkMember = getCheckMember(userQuery);

  return {
    getMessagesInChannel: async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
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
        if (!(await checkMember(channelId, requesterId)))
          return res
            .status(400)
            .send({ detail: "requester is not a member of channel" });
        // get channel info
        const channel = await channelQuery.getChannelById(channelId);
        if (!channel)
          return res
            .status(400)
            .send({ detail: `channel ID: ${channelId} not found` });
        // get messages
        const messages = (
          await messageQuery.getMessagesInChannel(channelId)
        ).map((m) => ({
          id: m.id,
          channelId,
          content: m.content,
          createdAt: m.createdAt.getTime(),
          updatedAt: m.updatedAt.getTime(),
          sender: {
            id: m.sender.id,
            username: m.sender.username,
            displayName: m.sender.displayName,
            firstName: m.sender.firstName,
            lastName: m.sender.lastName,
          },
        }));

        return res.status(200).send({
          detail: "success",
          channel: {
            id: channel.id,
            name: channel.name,
          },
          messages,
        });
      } catch (e) {
        return res.status(500).send({ detail: e.message });
      }
    },

    getSpecificMessageInChannel: async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      const { messageId, channelId } = req.params;
      const { userId: requesterId } = req.session;
      // validate messageId
      if (!validate(messageId))
        return res.status(400).send({ detail: "invalid message ID" });
      // validate channelId
      if (!validate(channelId))
        return res
          .status(400)
          .send({ detail: `invalid channel ID: ${channelId}` });
      // validate requesterId
      if (!validate(requesterId))
        return res.status(400).send({ detail: "invalid requester ID" });
      try {
        // get user
        const users = (await userQuery.getUsersByChannelId(channelId)).map(
          (u) => u.id
        );
        if (!users.includes(requesterId))
          return res
            .status(400)
            .send({ detail: "requester is not a member of channel" });
        // get message
        const message = await messageQuery.getSpecificMessage(
          messageId,
          channelId
        );
        if (!message)
          return res.status(400).send({
            detail: `couldn't find the message - channel ID: ${channelId}, message ID: ${messageId}`,
          });
        // respond a message
        const { id, content, createdAt, updatedAt, sender } = message;
        return res.status(200).send({
          detail: "success",
          message: {
            id,
            channelId,
            content,
            createdAt: createdAt.getTime(),
            updatedAt: updatedAt.getTime(),
            sender: {
              id: sender.id,
              username: sender.username,
              displayName: sender.displayName,
              firstname: sender.firstName,
              lastName: sender.lastName,
            },
          },
        });
      } catch (e) {
        return res.status(500).send({ detail: e.message });
      }
    },

    postMessage: async (req: Request, res: Response, next: NextFunction) => {
      const { content } = req.body;
      const { channelId } = req.params;
      const { userId: requesterId, username } = req.session;
      // validate requesterId
      if (!validate(requesterId))
        return res.status(400).send({ detail: "invalid requester ID" });
      // validate channelId
      if (!validate(channelId))
        return res
          .status(400)
          .send({ detail: `invalid channel ID: ${channelId}` });
      // generate messageId
      const messageId = uuid();
      try {
        if (!(await checkMember(channelId, requesterId)))
          return res
            .status(400)
            .send({ detail: "requester is not a member of channel" });
        // check if message already exists
        if (await messageQuery.getSpecificMessage(messageId, channelId))
          return res.status(400).send({ detail: "message ID already exists" });
        // create message
        const sender = { id: requesterId, name: username };
        const event: MessageCreatedEvent = {
          type: "MessageCreated",
          metadata: { traceId: uuid(), timestamp: Date.now() },
          payload: { channelId, messageId, sender, content },
        };
        await config.kafka.producer.send({
          topic: "chat",
          messages: [{ value: JSON.stringify(event) }],
        });
        return res.status(201).send({
          detail: "success",
          message: {
            id: messageId,
            channelId,
            content,
            sender: { id: requesterId },
          },
        });
      } catch (e) {
        const statusCode =
          e.message === `channel ID ${channelId} doesn't exist` ? 400 : 500;
        return res.status(statusCode).send({ detail: e.message });
      }
    },

    editMessage: async (req: Request, res: Response, next: NextFunction) => {
      const { userId: requesterId, username } = req.session;
      const { messageId, channelId } = req.params;
      const { content } = req.body;
      // validate messageId
      if (!validate(messageId))
        return res.status(400).send({ detail: "invalid message ID" });
      // validate channelId
      if (!validate(channelId))
        return res
          .status(400)
          .send({ detail: `invalid channel ID: ${channelId}` });
      // validate requesterid
      if (!validate(requesterId))
        return res.status(400).send({ detail: "invalid requester ID" });
      try {
        // get a message
        const message = await messageQuery.getSpecificMessage(
          messageId,
          channelId
        );
        if (!message)
          return res.status(400).send({ detail: "message doesn't exist" });
        if (message!.sender.id !== requesterId)
          return res
            .status(400)
            .send({ detail: "you can't edit other user's message" });
        // update the message
        const sender = { id: requesterId, name: username };
        const event: MessageUpdatedEvent = {
          type: "MessageUpdated",
          metadata: { traceId: uuid(), timestamp: Date.now() },
          payload: { channelId, messageId, sender, content },
        };
        await config.kafka.producer.send({
          topic: "chat",
          messages: [{ value: JSON.stringify(event) }],
        });
        return res.status(200).send({ detail: "success" });
      } catch (e) {
        return res.status(500).send({ detail: e.message });
      }
    },

    deleteMessage: async (req: Request, res: Response, next: NextFunction) => {
      const { messageId, channelId } = req.params;
      const { userId: requesterId, username } = req.session;
      // validate messageId
      if (!validate(messageId))
        return res
          .status(400)
          .send({ detail: `invalid message ID: ${messageId}` });
      // validate messageId
      if (!validate(channelId))
        return res
          .status(400)
          .send({ detail: `invalid channel ID: ${channelId}` });
      // validate requesterId
      if (!validate(requesterId))
        return res
          .status(400)
          .send({ detail: `invalid requester ID: ${requesterId}` });
      try {
        // check if we have the message in the database
        const message = await messageQuery.getSpecificMessage(
          messageId,
          channelId
        );
        if (!message)
          return res.status(400).send({
            detail: `message doesn't exist: ${channelId} - ${messageId}`,
          });
        if (message.sender.id !== requesterId)
          return res
            .status(400)
            .send({ detail: "you can't edit other user's message" });
        // const count = await messageQuery.deleteMessage(messageId);
        const sender = { id: requesterId, name: username };
        const event: MessageDeletedEvent = {
          type: "MessageDeleted",
          metadata: { traceId: uuid(), timestamp: Date.now() },
          payload: { channelId, messageId, sender },
        };
        await config.kafka.producer.send({
          topic: "chat",
          messages: [{ value: JSON.stringify(event) }],
        });
        return res.status(204).send();
      } catch (e) {
        return res.status(500).send({ detail: e.message });
      }
    },
  };
};
