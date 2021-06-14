import Channel from "../models/Channel.model";
import Roster from "../models/Roster.model";
import User from "../models/User.model";

interface RosterQuery {
  // returns roster record
  addUserToChannel: (param: {
    channelId: string;
    userId: string;
    joinedAt: number;
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
  user: typeof User;
  channel: typeof Channel;
  roster: typeof Roster;
}): RosterQuery => {
  return {
    addUserToChannel(param: {
      channelId: string;
      userId: string;
      joinedAt: number;
    }): Promise<Roster> {
      throw new Error("Not Implemented");
    },

    getUsersByChannelId(param: { channelId: string }): Promise<User[]> {
      throw new Error("Not Implemented");
    },

    async getChannelsByUserId(param: { userId: string }): Promise<Channel[]> {
      try {
        const user = await models.user.findOne({
          where: { id: param.userId },
          include: [Channel],
        });
        if (!user) throw new Error(`User ${param.userId} doesn't exist`);
        const { channels } = user;
        console.log("channels: ", channels);
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
