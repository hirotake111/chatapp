import { RequestHandler, Request, Response, NextFunction } from "express";
import { v4 as uuid, validate } from "uuid";
import { MessageQuery } from "../queries/messageQuery";
import { UserQuery } from "../queries/userQuery";

export interface MessageController {
  getMessagesInChannel: RequestHandler;
  getSpecificMessageInChannel: RequestHandler;
  postMessage: RequestHandler;
  editMessage: RequestHandler;
  deleteMessage: RequestHandler;
}

export const getMessageController = ({
  messageQuery,
  userQuery,
}: {
  messageQuery: MessageQuery;
  userQuery: UserQuery;
}): MessageController => {
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
        return res.status(400).send({ detail: "invalid channel ID" });
      // validate requesterId
      if (!validate(requesterId))
        return res.status(400).send({ detail: "invalid requester ID" });
      try {
        // get members of channel
        const members = (await userQuery.getUsersByChannelId(channelId)).map(
          (u) => u.id
        );
        if (!members.includes(requesterId))
          return res
            .status(400)
            .send({ detail: "requester is not a member of channel" });
        // get messages
        const messages = await messageQuery.getMessagesInChannel(channelId);
        return res.status(200).send({ detail: "success", messages });
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
        return res.status(400).send({ detail: "invalid channel ID" });
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
        return res.status(200).send({ detail: "success", message });
      } catch (e) {
        return res.status(500).send({ detail: e.message });
      }
    },

    postMessage: async (req: Request, res: Response, next: NextFunction) => {
      const { content } = req.body;
      const { channelId } = req.params;
      const { userId: requesterId } = req.session;
      // validate requesterId
      if (!validate(requesterId))
        return res.status(400).send({ detail: "invalid requester ID" });
      // validate channelId
      if (!validate(channelId))
        return res.status(400).send({ detail: "invalid channel ID" });
      // generate messageId
      const messageId = uuid();
      try {
        // get users
        const users = (await userQuery.getUsersByChannelId(channelId)).map(
          (u) => u.id
        );
        if (!users.includes(requesterId))
          return res
            .status(400)
            .send({ detail: "requester is not a member of channel" });
        // check if message already exists
        if (await messageQuery.getSpecificMessage(messageId, channelId))
          return res.status(400).send({ detail: "message ID already exists" });
        // create message
        const message = await messageQuery.createMessage(
          messageId,
          channelId,
          requesterId,
          content
        );
        return res.status(201).send({ detail: "success", message });
      } catch (e) {
        const statusCode =
          e.message === `channel ID ${channelId} doesn't exist` ? 400 : 500;
        return res.status(statusCode).send({ detail: e.message });
      }
    },

    editMessage: async (req: Request, res: Response, next: NextFunction) => {
      const { userId: requesterId } = req.session;
      const { messageId, channelId } = req.params;
      const { content } = req.body;
      // validate messageId
      if (!validate(messageId))
        return res.status(400).send({ detail: "invalid message ID" });
      // validate channelId
      if (!validate(channelId))
        return res.status(400).send({ detail: "invalid channel ID" });
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
        if (message!.senderId !== requesterId)
          return res
            .status(400)
            .send({ detail: "you can't edit other user's message" });
        // update the message
        const updated = messageQuery.editMessage(messageId, channelId, content);
        return res.status(200).send({ detail: "success", message: updated });
      } catch (e) {
        return res.status(500).send({ detail: e.message });
      }
    },

    deleteMessage: async (req: Request, res: Response, next: NextFunction) => {
      const { messageId, channelId } = req.params;
      const { userId: requesterId } = req.session;
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
        if (message.senderId !== requesterId)
          return res
            .status(400)
            .send({ detail: "you can't edit other user's message" });
        const count = await messageQuery.deleteMessage(messageId);
        return res.status(204).send({ detail: "success", count });
      } catch (e) {
        return res.status(500).send({ detail: e.message });
      }
    },
  };
};
