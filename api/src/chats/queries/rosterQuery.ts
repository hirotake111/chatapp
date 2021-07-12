import { validate } from "uuid";

import Roster from "../models/Roster.model";

export interface RosterQuery {
  // adds and returns roster record
  addUserToChannel: (channelId: string, userId: string) => Promise<Roster>;
  // delete and return 1 if succeeded
  deleteUserFromChannel: (channelId: string, userId: string) => Promise<number>;
}

export const getRosterQuery = (params: {
  RosterModel: typeof Roster;
}): RosterQuery => {
  const { RosterModel } = params;
  return {
    async addUserToChannel(channelId: string, userId: string): Promise<Roster> {
      // validate input
      if (!(validate(channelId) && validate(userId)))
        throw new Error("invalid input");
      try {
        const roster = await RosterModel.create({ channelId, userId });
        return roster;
      } catch (e) {
        throw e;
      }
    },

    async deleteUserFromChannel(
      channelId: string,
      userId: string
    ): Promise<number> {
      // validate input
      if (!(validate(channelId) && validate(userId)))
        throw new Error("invalid input");
      try {
        // delete user
        const result = await RosterModel.destroy({
          where: { channelId, userId },
        });
        return result;
      } catch (e) {
        throw e;
      }
    },
  };
};
