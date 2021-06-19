import Channel from "../models/Channel.model";
import Roster from "../models/Roster.model";
import User from "../models/User.model";

export interface RosterQuery {
  // adds and returns roster record
  addUserToChannel: (param: {
    channelId: string;
    userId: string;
  }) => Promise<Roster>;
  // returns an array of user
  getUsersByChannelId: (param: { channelId: string }) => Promise<User[]>;
  getChannelsByUserId: (param: { userId: string }) => Promise<Channel[]>;
  deleteUserFromChannel: (param: {
    channelId: string;
    userId: string;
  }) => Promise<number>;
}

export const getRosterQuery = (models: {
  UserModel: typeof User;
  ChannelModel: typeof Channel;
  RosterModel: typeof Roster;
}): RosterQuery => {
  return {
    async addUserToChannel({
      channelId,
      userId,
    }: {
      channelId: string;
      userId: string;
    }): Promise<Roster> {
      try {
        const roster = await Roster.create({ channelId, userId });
        if (!roster)
          throw new Error(
            `failed to add user ${userId} to channel ${channelId}`
          );
        return roster;
      } catch (e) {
        throw e;
      }
    },

    async getUsersByChannelId(param: { channelId: string }): Promise<User[]> {
      throw new Error("Not Implemented");
    },

    async getChannelsByUserId(param: { userId: string }): Promise<Channel[]> {
      try {
        const user = await models.UserModel.findOne({
          where: { id: param.userId },
          include: [Channel],
        });
        if (!user) throw new Error(`User ${param.userId} doesn't exist`);
        const { channels } = user;
        // console.log("channels: ", channels);
        return channels;
      } catch (e) {
        throw e;
      }
    },

    deleteUserFromChannel(param: {
      channelId: string;
      userId: string;
    }): Promise<number> {
      throw new Error("Not Implemented");
    },
  };
};
