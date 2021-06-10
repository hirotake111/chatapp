import { nanoid } from "nanoid";
import Channel from "../models/Channel.model";
import { ChannelQuery, getChannelQuery } from "./channel.query";

interface ChannelType {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  deleteAt?: number;
}

let db: ChannelType[];
let model: any;

describe("channel.query", () => {
  beforeEach(() => {
    db = [];
    model = {
      create: async (params: { id: string; name: string }) => {
        const { id, name } = params;
        return new Promise<ChannelType>((resolve, reject) =>
          resolve({
            id,
            name,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        );
      },
      findOne: async (param: { where: { id: string } }) => {
        return new Promise<ChannelType | null>((resolve, reject) => {
          const channel = db.filter((ch) => ch.id === param.where.id);
          if (channel.length === 0) resolve(null);
          return resolve(channel[0]);
        });
      },
    } as any;
  });

  describe("createChannel()", () => {
    it("should return a new channel", async () => {
      expect.assertions(4);
      const id = nanoid();
      const name = nanoid();
      const query = getChannelQuery(model);
      try {
        const ch = await query.createChannel(id, name);
        if (!ch) throw new Error("FAILED CREATING OR FETCHING CHANNEL");
        expect(ch.id).toEqual(id);
        expect(ch.name).toEqual(name);
        expect(ch.createdAt).toBeTruthy();
        expect(ch.updatedAt).toBeTruthy();
      } catch (e) {
        throw e;
      }
    });

    it("should return null if the same ID already exists", async () => {
      expect.assertions(1);
      // add a channel directly to db
      const id = nanoid();
      const name = nanoid();
      db.push({ id, name, createdAt: Date.now(), updatedAt: Date.now() });
      try {
        // create a new channel with the same ID
        const query = getChannelQuery(model);
        const ch = await query.createChannel(id, nanoid());
        expect(ch).toBeNull();
      } catch (e) {
        throw e;
      }
    });

    it("should return a new channel even if the same name already exists", async () => {
      expect.assertions(2);
      // add a channel directly to db
      const id = nanoid();
      const name = nanoid();
      db.push({ id, name, createdAt: Date.now(), updatedAt: Date.now() });
      try {
        // create a new channel with the same name
        const query = getChannelQuery(model);
        const newId = nanoid();
        const ch = await query.createChannel(newId, name);
        if (!ch)
          throw new Error(
            `UNABLE TO CRATE A NEW CHANNEL WITH ID ${id} and NAME ${name}`
          );
        expect(ch.name).toEqual(name);
        expect(ch.id).toEqual(newId);
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error for other reason", async () => {
      expect.assertions(1);
      // implement a mehtod that always thow an error
      const msg = "Database Error";
      model.findOne = (param: any) => {
        throw new Error(msg);
      };
      try {
        const query = getChannelQuery(model);
        await query.createChannel(nanoid(), nanoid());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("getChannelById()", () => {
    it("should return a channel", async () => {
      expect.assertions(1);
      // add a new channel to db
      const id = nanoid();
      const name = nanoid();
      const createdAt = Date.now();
      const updatedAt = createdAt;
      db.push({ id, name, createdAt, updatedAt });
      // get the channel by ID
      const query = getChannelQuery(model);
      try {
        const ch = await query.getChannelById(id);
        if (!ch) throw new Error(`UNABLE TO GET CHANNEL BY ID ${id}`);
        expect(ch.name).toEqual(name);
      } catch (e) {
        throw e;
      }
    });

    it("should return null if not exists", async () => {
      expect.assertions(1);
      // add a new channel to db
      const id = nanoid();
      const name = nanoid();
      const createdAt = Date.now();
      const updatedAt = createdAt;
      db.push({ id, name, createdAt, updatedAt });
      try {
        const query = getChannelQuery(model);
        // fetch a channel by ID that does not exist
        const ch = await query.getChannelById(nanoid());
        expect(ch).toBeNull();
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error for other reason", async () => {
      expect.assertions(1);
      // implement a mehtod that always thow an error
      const msg = "Database Error";
      model.findOne = (param: any) => {
        throw new Error(msg);
      };
      try {
        const query = getChannelQuery(model);
        await query.getChannelById(nanoid());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  // describe("updateChannel()", () => {
  //   it("should return an updated channel", async () => {
  //     expect.assertions(1);
  //   });

  //   it("should return a channel even if nothing has changed", async () => {
  //     expect.assertions(1);
  //   });

  //   it("should return null if not exists", async () => {
  //     expect.assertions(1);
  //   });
  //   it("should raise an error for other reason", async () => {
  //     expect.assertions(1);
  //   });
  // });

  // describe("deleteChannel()", () => {
  //   it("should return 1 if scceeded", async () => {
  //     expect.assertions(1);
  //   });

  //   it("should return 0 if not exists", async () => {
  //     expect.assertions(1);
  //   });

  //   it("should raise an error for other reason", async () => {
  //     expect.assertions(1);
  //   });
  // });
});
