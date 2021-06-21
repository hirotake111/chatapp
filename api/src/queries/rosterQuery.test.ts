import { nanoid } from "nanoid";
import { v4 as uuid } from "uuid";
import Roster from "../models/Roster.model";
import { getRosterQuery, RosterQuery } from "./rosterQuery";

let rosterDb: Roster[];
let RosterModel: typeof Roster;
let rosterQuery: RosterQuery;

describe("RosterQuery", () => {
  beforeEach(async () => {
    rosterDb = [];
    RosterModel = {
      create: async ({
        channelId,
        userId,
      }: {
        channelId: string;
        userId: string;
      }): Promise<Roster | null> => {
        return new Promise<Roster>((resolve) => {
          const roster = { id: uuid(), channelId, userId } as Roster;
          rosterDb.push(roster);
          resolve(roster);
        });
      },
      destroy: async (options: {
        where: { channelId: string; userId: string };
      }): Promise<number> => {
        const { channelId, userId } = options.where;
        const rosters = rosterDb.filter(
          (row) => row.channelId === channelId && row.userId === userId
        );
        const result = rosters.length;
        return result;
      },
    } as any;
    rosterQuery = getRosterQuery({ RosterModel });
  });

  describe("addUserToChannel()", () => {
    it("should add a user to channel", async () => {
      expect.assertions(2);
      const channelId = uuid();
      const userId = uuid();
      // add a user to the channel
      try {
        const roster = await rosterQuery.addUserToChannel(channelId, userId);
        if (roster) {
          expect(roster.channelId).toEqual(channelId);
          expect(roster.userId).toEqual(userId);
        }
      } catch (e) {
        throw e;
      }
    });

    it("shoud raise an error for any other reasons", async () => {
      expect.assertions(1);
      // this should raise an error
      const msg = "database error";
      RosterModel.create = (params: any) => {
        throw new Error(msg);
      };
      try {
        await rosterQuery.addUserToChannel(uuid(), uuid());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("deleteUserFromChannel", () => {
    it("should delete user from channel", async () => {
      expect.assertions(1);
      const channelId = uuid();
      const userId = uuid();
      try {
        // add a record directly to db
        await RosterModel.create({ channelId, userId });
        await RosterModel.create({ channelId: uuid(), userId: uuid() });
        // delete it
        const result = await rosterQuery.deleteUserFromChannel(
          channelId,
          userId
        );
        expect(result).toEqual(1);
      } catch (e) {
        throw e;
      }
    });

    it("should validate channel ID and user ID", async () => {
      expect.assertions(2);
      try {
        // add a record directly to db
        let channelId = nanoid();
        let userId = uuid();
        await RosterModel.create({ channelId, userId });
        // delete it
        await rosterQuery.deleteUserFromChannel(channelId, userId);
      } catch (e) {
        expect(e.message).toEqual("invalid input");
      }
      try {
        // add a record directly to db
        let channelId = uuid();
        let userId = nanoid();
        await RosterModel.create({ channelId, userId });
        // delete it
        await rosterQuery.deleteUserFromChannel(channelId, userId);
      } catch (e) {
        expect(e.message).toEqual("invalid input");
      }
    });

    it("should raise an error for any other errors", async () => {
      expect.assertions(1);
      const msg = "database error";
      RosterModel.destroy = (optons: any) => {
        throw new Error(msg);
      };
      try {
        await rosterQuery.deleteUserFromChannel(uuid(), uuid());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });
});
