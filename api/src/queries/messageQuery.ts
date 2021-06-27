import { validate } from "uuid";

import Message from "../models/Message.model";

export interface MessageQuery {
  /** create a new message. If the message ID already exists, then return null. */
  createMessage: (
    messageId: string,
    channelId: string,
    senderId: string,
    content: string
  ) => Promise<Message | null>;
  getMessagesInChannel: (channelId: string) => Promise<Message[]>;
  /**
   * returns one message, or null if not exists
   */
  getSpecificMessage: (
    messageId: string,
    channelId: string
  ) => Promise<Message | null>;
  /**
   * edit an existig message. If not exist, return null
   */
  editMessage: (
    messageId: string,
    channelId: string,
    newConntent: string
  ) => Promise<number | null>;
  deleteMessage: (messageId: string) => Promise<number>;
}

export const getMessageQuery = ({
  messageModel,
}: {
  messageModel: typeof Message;
}): MessageQuery => {
  return {
    createMessage: async (
      messageId: string,
      channelId: string,
      senderId: string,
      content: string
    ): Promise<Message | null> => {
      // validate messageId
      if (!validate(messageId)) throw new Error("invalid message ID");
      // validate channelId
      if (!validate(channelId))
        throw new Error(`invalid channel ID: ${channelId}`);
      // validate senderId
      if (!validate(senderId)) throw new Error("invalid sender ID");
      // validate content
      if (content === "") throw new Error("content can't be empty");
      try {
        // check to see if there is one in database
        // if exists, then return null (indicating there is the one already)
        if (
          await messageModel.findOne({
            where: { id: messageId, channelId },
          })
        )
          return null;
        // create a new one and return it
        return await messageModel.create({
          id: messageId,
          channelId,
          senderId,
          content,
        });
      } catch (e) {
        throw e;
      }
    },

    getMessagesInChannel: async (channelId: string): Promise<Message[]> => {
      // validate channelId
      if (!validate(channelId))
        throw new Error(`invalid channel ID: ${channelId}`);
      try {
        return await messageModel.findAll({ where: { channelId } });
      } catch (e) {
        throw e;
      }
    },

    getSpecificMessage: async (
      messageId: string,
      channelId: string
    ): Promise<Message | null> => {
      // validate messageId
      if (!validate(messageId)) throw new Error("invalid message ID");
      try {
        const message = await messageModel.findOne({
          where: { id: messageId, channelId },
        });
        return message;
      } catch (e) {
        throw e;
      }
    },

    editMessage: async (
      messageId: string,
      channelId: string,
      newContent: string
    ): Promise<number | null> => {
      // validate messageId
      if (!validate(messageId)) throw new Error("invalid message ID");
      // validate channelid
      if (!validate(channelId))
        throw new Error(`invalid channel ID: ${channelId}`);
      // validate content
      if (newContent === "") throw new Error("content can't be empty");
      try {
        // if no such message, return null
        if (
          !(await messageModel.findOne({ where: { id: messageId, channelId } }))
        )
          return null;
        // update message
        const [count, messages] = await messageModel.update(
          { content: newContent },
          { where: { id: messageId } }
        );
        return count;
      } catch (e) {
        throw e;
      }
    },

    deleteMessage: async (messageId: string): Promise<number> => {
      // validate messageId
      if (!validate(messageId)) throw new Error("invalid message ID");
      try {
        return await messageModel.destroy({ where: { id: messageId } });
      } catch (e) {
        throw e;
      }
    },
  };
};
