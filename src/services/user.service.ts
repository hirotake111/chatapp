import { Op } from "sequelize";
import { v4 as uuid } from "uuid";

import { User } from "../models/User.model";
import { CreateUserProps } from "../type";

export class UserService {
  /**
   * returns User model
   * @param id string
   */
  static async getUserById(id: string): Promise<User | null> {
    try {
      return await User.findOne({ where: { id } });
    } catch (e) {
      throw e;
    }
  }

  /**
   * returns User model
   * @param id string
   */
  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      return await User.findOne({ where: { username } });
    } catch (e) {
      throw e;
    }
  }

  /**
   * return User, or null if already exists
   */
  static async createUser(user: CreateUserProps): Promise<User | null> {
    try {
      const id = uuid();
      const { username, displayName, firstName, lastName } = user;
      // if the username or displayname already exists, skip it
      const userExists = await User.findOne({
        where: {
          [Op.or]: [{ id }, { username }, { displayName }],
        },
      });
      if (userExists) {
        return null;
      }

      const timestamp = Date.now();
      return await User.create({
        id,
        username,
        displayName,
        firstName,
        lastName,
      });
    } catch (e) {
      throw e;
    }
  }

  static async deleteUserById(id: string): Promise<number> {
    try {
      return await User.destroy({ where: { id } });
    } catch (e) {
      throw e;
    }
  }
}

export type UserServiceFactory = typeof UserService;
