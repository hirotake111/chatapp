import { Op } from "sequelize";
import { validate } from "uuid";

import User from "../models/User.model";
import Channel from "../models/Channel.model";

export interface UserQuery {
  getUserById: (id: string) => Promise<User | null>;
  getUserByUsername: (username: string) => Promise<User | null>;
  createUser: (user: CreateUserProps) => Promise<User | null>;
  deleteUserById: (id: string) => Promise<number>;
  getOtherUsers: (id: string, searchQuery?: string) => Promise<User[]>;
  getUsersByChannelId: (channelId: string) => Promise<User[]>;
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

    async getOtherUsers(id: string, searchQuery?: string): Promise<User[]> {
      try {
        // get other users expect user itself
        const users = await UserModel.findAll({
          where: searchQuery
            ? {
                id: { [Op.ne]: id },
                username: { [Op.like]: `%${searchQuery}%` },
              }
            : {
                id: { [Op.ne]: id },
              },
        });
        return users;
      } catch (e) {
        throw e;
      }
    },

    /**
     * returns an array of members specific channel
     * raise an error if requester is not a member of the channel
     */
    async getUsersByChannelId(channelId: string): Promise<User[]> {
      // validate channel ID
      if (!validate(channelId)) throw new Error("invalid input");
      // get channel
      try {
        const channel = await ChannelModel.findOne({
          where: { id: channelId },
          include: [User],
        });
        // if channel doesn't exist throw an error
        if (!channel) throw new Error(`channel ID ${channelId} doesn't exist`);
        // return members
        return channel.users;
      } catch (e) {
        throw e;
      }
    },
  };
};
