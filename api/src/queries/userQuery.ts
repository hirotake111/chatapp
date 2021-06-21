import { Op } from "sequelize";
import { validate } from "uuid";

import User from "../models/User.model";
import Channel from "../models/Channel.model";

export interface UserQuery {
  getUserById: (id: string) => Promise<User | null>;
  getUserByUsername: (username: string) => Promise<User | null>;
  createUser: (user: CreateUserProps) => Promise<User | null>;
  deleteUserById: (id: string) => Promise<number>;
  getOtherUsers: (id: string) => Promise<User[] | null>;
  getUsersByChannelId: (
    channelId: string,
    requesterId: string
  ) => Promise<User[]>;
}

export const getUserQuery = ({
  UserModel,
  ChannelModel,
}: {
  UserModel: typeof User;
  ChannelModel: typeof Channel;
}): UserQuery => {
  return {
    /**
     * returns User model
     * @param id {string}
     */
    async getUserById(id: string): Promise<User | null> {
      try {
        return await UserModel.findOne({ where: { id } });
      } catch (e) {
        throw e;
      }
    },

    /**
     * returns User model
     * @param id string
     */
    async getUserByUsername(username: string): Promise<User | null> {
      try {
        return await UserModel.findOne({ where: { username } });
      } catch (e) {
        throw e;
      }
    },

    /**
     * return User, or null if already exists
     */
    async createUser(user: CreateUserProps): Promise<User | null> {
      try {
        const { id, username, displayName, firstName, lastName } = user;
        // if the username or displayname already exists, skip it
        const userExists = await UserModel.findOne({
          where: {
            [Op.or]: [{ id }, { username }, { displayName }],
          },
        });
        if (userExists) {
          return null;
        }

        return await UserModel.create({
          id,
          username,
          displayName,
          firstName,
          lastName,
        });
      } catch (e) {
        throw e;
      }
    },

    async deleteUserById(id: string): Promise<number> {
      try {
        return await UserModel.destroy({ where: { id } });
      } catch (e) {
        throw e;
      }
    },

    async getOtherUsers(id: string): Promise<User[] | null> {
      try {
        // get other users expect user itself
        const users = await UserModel.findAll({
          where: { id: { [Op.ne]: id } },
        });
        return users;
      } catch (e) {
        throw e;
      }
    },

    /**
     * returns an array of members specific channel
     */
    async getUsersByChannelId(
      channelId: string,
      requesterId: string
    ): Promise<User[]> {
      // validate channel ID
      if (!validate(channelId)) throw new Error("invalid input");
      // get channel
      try {
        const channel = await ChannelModel.findOne({
          where: { id: channelId },
          include: [User],
        });
        // if channel doesn't exist throw error
        if (!channel) throw new Error(`channel ID ${channelId} doesn't exist`);
        // check if requester is a member of the channel
        const users = channel.users.filter((user) => user.id === requesterId);
        if (users.length === 0)
          throw new Error("requester doesn't belong to the channel");
        // return members
        return channel.users;
      } catch (e) {
        throw e;
      }
    },
  };
};
