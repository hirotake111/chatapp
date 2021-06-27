import { validate } from "uuid";

import Channel from "../models/Channel.model";
import Message from "../models/Message.model";
import User from "../models/User.model";

export interface ChannelQuery {
  /**
   * createChannel
   * - creates a new channel and returns it
   * - returns null if ID already exists
   */
  createChannel: (id: string, name: string) => Promise<Channel | null>;
  /**
   * getChannelById
   * - returns a specific channel to mainly retrieve channel name
   */
  getChannelById: (channelId: string) => Promise<Channel | null>;
  getChannelByChannelIdWithMessages: (
    channelId: string
  ) => Promise<Channel | null>;
  getChannelsByUserId: (userId: string) => Promise<Channel[]>;
  updateChannelbyId: (
    channelId: string,
    newChannelName: string
  ) => Promise<Channel | null>;
  deleteChannelById: (id: string) => Promise<number>;
}

export const getChannelQuery = ({
  ChannelModel: ChannelModel,
  UserModel: UserModel,
  MessageModel: MessageModel,
}: {
  ChannelModel: typeof Channel;
  UserModel: typeof User;
  MessageModel: typeof Message;
}): ChannelQuery => {
  return {
    async createChannel(id: string, name: string): Promise<Channel | null> {
      try {
        // check to see if the id already exists
        if (await ChannelModel.findOne({ where: { id } })) {
          return null;
        }
        return await ChannelModel.create({ id, name });
      } catch (e) {
        throw e;
      }
    },

    async getChannelById(channelId: string): Promise<Channel | null> {
      // validate input
      if (!validate(channelId)) throw new Error("invalid input");
      // retrieve a channel with channel ID
      try {
        return await ChannelModel.findOne({ where: { id: channelId } });
      } catch (e) {
        throw e;
      }
    },

    async getChannelsByUserId(userId: string): Promise<Channel[]> {
      try {
        const user = await UserModel.findOne({
          where: { id: userId },
          include: [ChannelModel],
        });
        return user ? user.channels : [];
      } catch (e) {
        throw e;
      }
    },

    async updateChannelbyId(
      channelId: string,
      newChannelName: string
    ): Promise<Channel | null> {
      try {
        // throw an error if channel doesn't exist
        if (!(await ChannelModel.findOne({ where: { id: channelId } })))
          throw new Error(`id ${channelId} does not eixst`);
        // update channel
        const [_, ch] = await ChannelModel.update(
          { name: newChannelName },
          { where: { id: channelId } }
        );
        return ch[0];
      } catch (e) {
        throw e;
      }
    },

    async deleteChannelById(id: string): Promise<number> {
      try {
        const result = await ChannelModel.destroy({ where: { id } });
        return result;
      } catch (e) {
        throw e;
      }
    },

    async getChannelByChannelIdWithMessages(
      channelId: string
    ): Promise<Channel | null> {
      // validate input
      if (!validate(channelId))
        throw new Error(`invalid channel ID: ${channelId}`);
      // retrieve a channel with channel ID
      try {
        return await ChannelModel.findOne({
          where: { id: channelId },
          include: [MessageModel],
        });
      } catch (e) {
        throw e;
      }
    },
  };
};
