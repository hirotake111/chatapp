import Channel from "../models/Channel.model";
import Roster from "../models/Roster.model";
import User from "../models/User.model";

export interface RosterQuery {
  // adds and returns roster record
  addUserToChannel: (channelId: string, userId: string) => Promise<Roster>;
  // returns an array of user
  getChannelsByUserId: (param: { userId: string }) => Promise<Channel[]>;
  // delete and return 1 if succeeded
  deleteUserFromChannel: (channelId: string, userId: string) => Promise<number>;
}

export const getRosterQuery = ({
  UserModel,
  ChannelModel,
  RosterModel,
}: {
  UserModel: typeof User;
  ChannelModel: typeof Channel;
  RosterModel: typeof Roster;
}): RosterQuery => {
  return {
    async addUserToChannel(channelId: string, userId: string): Promise<Roster> {
      try {
        const roster = await RosterModel.create({ channelId, userId });
        if (!roster)
          throw new Error(
            `failed to add user ${userId} to channel ${channelId}`
          );
        return roster;
      } catch (e) {
        throw e;
      }
    },

    async getChannelsByUserId(param: { userId: string }): Promise<Channel[]> {
      try {
        const user = await UserModel.findOne({
          where: { id: param.userId },
          include: [ChannelModel],
        });
        if (!user) throw new Error(`User ${param.userId} doesn't exist`);
        const { channels } = user;
        // console.log("channels: ", channels);
        return channels;
      } catch (e) {
        throw e;
      }
    },

    deleteUserFromChannel(channelId: string, userId: string): Promise<number> {
      throw new Error("Not Implemented");
    },
  };
};
