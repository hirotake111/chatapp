import { Op } from "sequelize";

import User from "../models/User.model";
import { CreateUserProps } from "../type";

export interface UserService {
  getUserById: (id: string) => Promise<User | null>;
  getUserByUsername: (username: string) => Promise<User | null>;
  createUser: (user: CreateUserProps) => Promise<User | null>;
  deleteUserById: (id: string) => Promise<number>;
}

export const getUserService = (UserModel: typeof User): UserService => {
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

        const timestamp = Date.now();
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
  };
};
