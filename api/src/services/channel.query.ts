import Channel from "../models/Channel.model";

export interface ChannelQuery {
  createChannel: (id: string, name: string) => Promise<Channel | null>;
  getChannelById: (id: string) => Promise<Channel | null>;
  updateChannelbyId: (
    id: string,
    name: string,
    updatedAt: number
  ) => Promise<Channel | null>;
  deleteChannel: (id: string) => Promise<number>;
}

export const getChannelQuery = (model: typeof Channel): ChannelQuery => {
  return {
    async createChannel(id: string, name: string): Promise<Channel | null> {
      try {
        // console.log("ChannelModel", ChannelModel);
        // check to see if the id already exists
        if (await model.findOne({ where: { id } })) {
          return null;
        }
        return await model.create({ id, name });
      } catch (e) {
        throw e;
      }
    },

    async getChannelById(id: string): Promise<Channel | null> {
      try {
        return await model.findOne({ where: { id } });
      } catch (e) {
        throw e;
      }
    },

    async updateChannelbyId(
      id: string,
      name: string,
      updatedAt: number
    ): Promise<Channel | null> {
      try {
        if (!(await model.findOne({ where: { id } })))
          throw new Error(`id ${id} does not eixst`);
        const [count, ch] = await model.update(
          { name, updatedAt },
          { where: { id } }
        );
        // console.log("result: ", count, ch);
        if (count === 0) throw new Error("error");
        return ch[0];
      } catch (e) {
        throw e;
      }
    },

    async deleteChannel(id: string): Promise<number> {
      try {
        const result = await model.destroy({ where: { id } });
        return result;
      } catch (e) {
        throw e;
      }
    },
  };
};
