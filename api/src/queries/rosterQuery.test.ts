import { stringify, v4 as uuid } from "uuid";
import Roster from "../models/Roster.model";
import { getRosterQuery, RosterQuery } from "./rosterQeury";

let rosterDb: Roster[];
let RosterModel: typeof Roster;
let UserModel = {} as any;
let ChannelModel = {} as any;
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
    } as any;
    rosterQuery = getRosterQuery({ UserModel, ChannelModel, RosterModel });
  });

  describe("addUserToChannel()", () => {
    it("should add a user to channel", async () => {
      expect.assertions(2);
      const channelId = uuid();
      const userId = uuid();
      // add a user to the channel
      try {
        const roster = await rosterQuery.addUserToChannel({
          channelId,
          userId,
        });
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
        await rosterQuery.addUserToChannel({
          channelId: uuid(),
          userId: uuid(),
        });
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });
});
