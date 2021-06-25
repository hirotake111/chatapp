import { validate } from "uuid";

import Message from "../models/Message.model";

export interface MessageQuery {
  createMessage: (
    channelId: string,
    senderId: string,
    content: string
  ) => Promise<Message | null>;
  getMessagesInChannel: (
    channelId: string,
    requesterId: string
  ) => Promise<Message[]>;
  getSpecificMessageInChannel: (
    channelId: string,
    messageId: string,
    requesterId: string
  ) => Promise<Message | null>;
  editMessage: (
    channelId: string,
    messageId: string,
    senderId: string,
    newConntent: string
  ) => Promise<Message | null>;
  deleteMessage: (
    channelId: string,
    messageId: string,
    senderId: string
  ) => Promise<number>;
}

export const getMessageQuery = ({
  messageModel,
}: {
  messageModel: typeof Message;
}): MessageQuery => {
  return {
    createMessage: async (
      channelId: string,
      senderId: string,
      content: string
    ): Promise<Message | null> => {
      throw new Error("not implemented");
    },
    getMessagesInChannel: async (
      channelId: string,
      requesterId: string
    ): Promise<Message[]> => {
      throw new Error("not implemented");
    },
    getSpecificMessageInChannel: async (
      channelId: string,
      messageId: string,
      requesterId: string
    ): Promise<Message | null> => {
      throw new Error("not implemented");
    },
    editMessage: async (
      channelId: string,
      messageId: string,
      senderId: string,
      newContent: string
    ): Promise<Message | null> => {
      throw new Error("not implemented");
    },
    deleteMessage: async (
      channelId: string,
      messageId: string,
      senderId: string
    ): Promise<number> => {
      throw new Error("not implemented");
    },
  };
};
