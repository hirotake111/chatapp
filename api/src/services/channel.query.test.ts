import { nanoid } from "nanoid";
import { getChannelQuery } from "./channel.query";

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
          // console.log("channel in findOne(): ", channel);
          if (channel.length === 0) resolve(null);
          return resolve(channel[0]);
        });
      },
      update: async (
        values: { name: string; updatedAt: number },
        options: { where: { id: string } }
      ) => {
        return new Promise((resolve, reject) => {
          let channels = db.filter((ch) => ch.id === options.where.id);
          channels[0] = { ...channels[0], ...values };
          resolve([channels.length, channels]);
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
      model.findOne = (_: any) => {
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

  describe("updateChannelbyId()", () => {
    it("should return an updated channel", async () => {
      expect.assertions(2);
      // add a channel directly to db
      const id = nanoid();
      const name = nanoid();
      const createdAt = Date.now();
      const updatedAt = createdAt;
      const ch = db.push({ id, name, createdAt, updatedAt });
      // update channel
      const newName = nanoid();
      const query = getChannelQuery(model);
      try {
        const updatedChannel = await query.updateChannelbyId(
          id,
          newName,
          updatedAt
        );
        if (!updatedChannel) throw new Error("FAIELD UPDATING CHANNEL");
        expect(updatedChannel.name).toEqual(newName);
        expect(updatedChannel.id).toEqual(id);
      } catch (e) {
        throw e;
      }
    });

    it("should return a channel even if nothing has changed", async () => {
      expect.assertions(2);
      // add a channel directly to db
      const id = nanoid();
      const name = nanoid();
      const createdAt = Date.now();
      const updatedAt = createdAt;
      const ch = db.push({ id, name, createdAt, updatedAt });
      // update channel
      const query = getChannelQuery(model);
      try {
        const updatedChannel = await query.updateChannelbyId(
          id,
          name,
          updatedAt
        );
        if (!updatedChannel) throw new Error("FAIELD UPDATING CHANNEL");
        expect(updatedChannel.name).toEqual(name);
        expect(updatedChannel.id).toEqual(id);
      } catch (e) {
        throw e;
      }
    });

    it("should raise an erorr if not exists", async () => {
      expect.assertions(1);
      // add a channel directly to db
      const id = nanoid();
      const name = nanoid();
      const query = getChannelQuery(model);
      try {
        // update channel
        const updatedChannel = await query.updateChannelbyId(
          id,
          name,
          Date.now()
        );
      } catch (e) {
        expect(e.message).toEqual(`id ${id} does not eixst`);
      }
    });

    it("should raise an error for other reason", async () => {
      expect.assertions(1);
      // implement method that always throw an error
      const msg = "database error";
      model.update = (values: any, options: any) => {
        throw new Error(msg);
      };
      const query = getChannelQuery(model);
      // add a channel directly to db
      const id = nanoid();
      const name = nanoid();
      db.push({ id, name, updatedAt: Date.now(), createdAt: Date.now() });
      try {
        await query.updateChannelbyId(id, name, Date.now());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

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
