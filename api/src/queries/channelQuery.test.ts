import { nanoid } from "nanoid";
import { v4 as uuid } from "uuid";

import { ChannelQuery, getChannelQuery } from "./channelQuery";
import User from "../models/User.model";
import Roster from "../models/Roster.model";
import Message from "../models/Message.model";
interface ChannelType {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  deleteAt?: number;
}

let db: ChannelType[];
let userDb: User[];
let rosterDb: Roster[];
let model: any;
let UserModel: any;
let MessageModel: typeof Message;
let query: ChannelQuery;

// helper function to add a channel to db
const addChannel = (id: string = uuid()): ChannelType => {
  const ch: ChannelType = {
    id,
    name: uuid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  db.push({ ...ch });
  return ch;
};

// helper function to add a roster to db
const addRoter = (channelId: string, userId: string) => {
  rosterDb.push({ id: uuid(), channelId, userId } as Roster);
};

// helper function to add a user to db
const addUser = (userId: string) => {
  userDb.push({ id: userId } as User);
};

describe("channel.query", () => {
  beforeEach(() => {
    db = [];
    userDb = [];
    rosterDb = [];
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
        return new Promise<[number, ChannelType[]]>((resolve, reject) => {
          let channels = db.filter((ch) => ch.id === options.where.id);
          channels[0] = { ...channels[0], ...values };
          resolve([channels.length, channels]);
        });
      },
      destroy: async (options: { where: { id: string } }) => {
        return new Promise<number>((resolve, reject) => {
          const previous = db.length;
          db = db.filter((row) => row.id !== options.where.id);
          resolve(previous - db.length);
        });
      },
    } as any;
    UserModel = {
      findOne: async (options: { where: { id: string } }) => {
        return new Promise<User | null>((resolve) => {
          const id = options.where.id;
          // get a user
          const user = userDb.filter((row) => row.id === id)[0];
          if (!user) resolve(null);
          const rosters = rosterDb.filter((row) => row.userId === id);
          resolve({
            id,
            username: user.username,
            channels: rosters.map((row) => row.channelId),
          } as any);
        });
      },
    };
    MessageModel = {} as any;
    query = getChannelQuery({
      ChannelModel: model,
      UserModel,
      MessageModel,
    });
  });

  describe("createChannel()", () => {
    it("should return a new channel", async () => {
      expect.assertions(4);
      const id = uuid();
      const name = uuid();
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
      const { id } = addChannel();
      try {
        // create a new channel with the same ID
        const ch = await query.createChannel(id, uuid());
        expect(ch).toBeNull();
      } catch (e) {
        throw e;
      }
    });

    it("should return a new channel even if the same name already exists", async () => {
      expect.assertions(2);
      // add a channel directly to db
      const { id, name } = addChannel();
      try {
        // create a new channel with the same name
        const newId = uuid();
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
        await query.createChannel(uuid(), uuid());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("getChannelById()", () => {
    it("should return a channel", async () => {
      expect.assertions(1);
      // add a new channel directly to db
      const { id, name } = addChannel();
      // get the channel by ID
      try {
        const ch = await query.getChannelById(id);
        if (!ch) throw new Error(`UNABLE TO GET CHANNEL BY ID ${id}`);
        expect(ch.name).toEqual(name);
      } catch (e) {
        throw e;
      }
    });

    it("should validate input", async () => {
      expect.assertions(1);
      // get a channel with ID (not uuidv4)
      try {
        await query.getChannelById(nanoid());
      } catch (e) {
        expect(e.message).toEqual("invalid input");
      }
    });

    it("should raise an erro for any other errors", async () => {
      expect.assertions(1);
      const msg = "db error";
      model.findOne = async (values: any) => {
        throw new Error(msg);
      };
      try {
        await query.getChannelById(uuid());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("getChannelsByUserId", () => {
    it("should return channels by user ID", async () => {
      expect.assertions(1);
      const userId = uuid();
      // add some channels directly to db;
      addRoter(uuid(), userId);
      addRoter(uuid(), userId);
      addRoter(uuid(), uuid());
      // add user record to user db
      addUser(userId);
      try {
        // get channel by userId
        const ch = await query.getChannelsByUserId(userId);
        expect(ch.length).toEqual(2);
      } catch (e) {
        throw e;
      }
    });

    it("should return [] if  user does not exists", async () => {
      expect.assertions(1);
      // add a new channel to db
      addChannel();
      try {
        // fetch a channel by ID that does not exist
        const ch = await query.getChannelsByUserId(uuid());
        expect(ch).toEqual([]);
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error for other reason", async () => {
      expect.assertions(1);
      // implement a mehtod that always thow an error
      const msg = "Database Error";
      UserModel.findOne = (_: any) => {
        throw new Error(msg);
      };
      try {
        await query.getChannelsByUserId(uuid());
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("updateChannelbyId()", () => {
    it("should return an updated channel", async () => {
      expect.assertions(2);
      // add a channel directly to db
      const { id, updatedAt } = addChannel();
      // update channel
      const newName = uuid();
      try {
        const updatedChannel = await query.updateChannelbyId(id, newName);
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
      const { id, name, updatedAt } = addChannel();
      // update channel
      try {
        const updatedChannel = await query.updateChannelbyId(id, name);
        if (!updatedChannel) throw new Error("FAIELD UPDATING CHANNEL");
        expect(updatedChannel.name).toEqual(name);
        expect(updatedChannel.id).toEqual(id);
      } catch (e) {
        throw e;
      }
    });

    it("should raise an erorr if not exists", async () => {
      expect.assertions(1);
      const id = uuid();
      try {
        // update channel
        await query.updateChannelbyId(id, uuid());
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
      // add a channel directly to db
      const id = uuid();
      const name = uuid();
      db.push({ id, name, updatedAt: Date.now(), createdAt: Date.now() });
      try {
        await query.updateChannelbyId(id, name);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("deleteChannel()", () => {
    it("should return 1 if scceeded", async () => {
      expect.assertions(2);
      // add a channel to db directly
      const { id } = addChannel();
      try {
        // delete item
        const count = await query.deleteChannelById(id);
        expect(count).toEqual(1);
        expect(db.length).toEqual(0);
      } catch (e) {
        throw e;
      }
    });

    it("should return 0 if not exists", async () => {
      expect.assertions(2);
      // add a channel to db directly
      addChannel();
      try {
        // delete another item
        const newId = uuid();
        const count = await query.deleteChannelById(newId);
        expect(count).toEqual(0);
        expect(db.length).toEqual(1);
      } catch (e) {
        throw e;
      }
    });

    it("should raise an error for other reason", async () => {
      expect.assertions(1);
      // implement method that always throw an error
      const msg = "database error";
      model.destroy = (options: any) => {
        throw new Error(msg);
      };
      // add a channel directly to db
      const id = uuid();
      const name = uuid();
      db.push({ id, name, updatedAt: Date.now(), createdAt: Date.now() });
      try {
        // delete channel
        await query.deleteChannelById(id);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });

  describe("getChannelByChannelIdWithMessage", () => {
    let channelId: string;
    let channel: any;
    beforeEach(() => {
      channelId = uuid();
      channel = {
        id: channelId,
        name: nanoid(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [{ id: uuid() }, { id: uuid() }],
      };
      model.findOne = jest.fn().mockReturnValue(channel);
    });

    it("should return channel with message", async () => {
      expect.assertions(1);
      try {
        const result = await query.getChannelByChannelIdWithMessages(channelId);
        expect(result).toEqual(channel);
      } catch (e) {
        throw e;
      }
    });

    it("should validate channelId", async () => {
      expect.assertions(1);
      const channelId = nanoid();
      try {
        await query.getChannelByChannelIdWithMessages(channelId);
      } catch (e) {
        expect(e.message).toEqual(`invalid channel ID: ${channelId}`);
      }
    });

    it("should raise an error", async () => {
      expect.assertions(1);
      const msg = "db error";
      model.findOne = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await query.getChannelByChannelIdWithMessages(channelId);
      } catch (e) {
        expect(e.message).toEqual(msg);
      }
    });
  });
});
