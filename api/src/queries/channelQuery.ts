import Channel from "../models/Channel.model";
import User from "../models/User.model";

export interface ChannelQuery {
  /**
   * createChannel
   * - creates a new channel and returns it
   * - returns null if ID already exists
   */
  createChannel: (id: string, name: string) => Promise<Channel | null>;
  getChannelByUserId: (id: string) => Promise<Channel | null>;
  updateChannelbyId: (
    id: string,
    name: string,
    updatedAt: number
  ) => Promise<Channel | null>;
  deleteChannelById: (id: string) => Promise<number>;
}

export const getChannelQuery = ({
  ChannelModel: ChannelModel,
  UserModel: UserModel,
}: {
  ChannelModel: typeof Channel;
  UserModel: typeof User;
}): ChannelQuery => {
  return {
    async createChannel(id: string, name: string): Promise<Channel | null> {
      try {
        // check to see if the id already exists
        if (await ChannelModel.findOne({ where: { id } })) {
          return null;
        }
        return await ChannelModel.create({ id, name });
      } catch (e) {
        throw e;
      }
    },

    async getChannelByUserId(id: string): Promise<Channel | null> {
      try {
        return await ChannelModel.findOne({ where: { id } });
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
        if (!(await ChannelModel.findOne({ where: { id } })))
          throw new Error(`id ${id} does not eixst`);
        const [count, ch] = await ChannelModel.update(
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

    async deleteChannelById(id: string): Promise<number> {
      try {
        const result = await ChannelModel.destroy({ where: { id } });
        return result;
      } catch (e) {
        throw e;
      }
    },
  };
};
