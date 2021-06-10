import Channel from "../models/Channel.model";

export interface ChannelQuery {
  createChannel: (id: string, name: string) => Promise<Channel | null>;
  getChannelById: (id: string) => Promise<Channel | null>;
  updateChannel: (
    id: string,
    name: string,
    updatedAt: number
  ) => Promise<Channel | null>;
  deleteChannel: (id: string) => Promise<number>;
}

export const getChannelQuery = (ChannelModel: typeof Channel): ChannelQuery => {
  return {
    async createChannel(id: string, name: string): Promise<Channel | null> {
      try {
        console.log("ChannelModel", ChannelModel);
        // check to see if the id already exists
        if (await ChannelModel.findOne({ where: { id } })) {
          return null;
        }
        return await ChannelModel.create({ id, name });
      } catch (e) {
        throw e;
      }
    },

    async getChannelById(id: string): Promise<Channel | null> {
      try {
        return await ChannelModel.findOne({ where: { id } });
      } catch (e) {
        throw e;
      }
    },

    async updateChannel(
      id: string,
      name: string,
      updatedAt: number
    ): Promise<Channel | null> {
      throw new Error("NotImplemented");
    },
    async deleteChannel(id: string): Promise<number> {
      throw new Error("NotImplemented");
    },
  };
};
