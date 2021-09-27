import { validateChannel } from "./utils";

interface CustomStorage {
  getChannel(channelId: string): ChannelPayload | {};
  setChannel(channelId: string, payload: ChannelPayload): void;
}

interface ValueInChannelsKey {
  [key: string]: ChannelPayload;
}

export const storage: CustomStorage = {
  /**
   * get data by channel ID from local storage. If not data in it, then return {}
   */
  getChannel(this: CustomStorage, channelId: string): ChannelPayload | {} {
    // get channels data
    const allChannels = JSON.parse(localStorage.getItem("channels") || "{}");
    // console.log("all channels:", allChannels);
    // if fetched data is empty object, then return it as default value
    if (Object.keys(allChannels).length === 0) return {};
    const data = allChannels[channelId];
    // else, it's not empty. validate channel and messages
    if (!data) return {};
    return validateChannel(data);
  },

  /**
   * set data using channel ID to local storage
   */
  setChannel(this: CustomStorage, channelId: string, payload: ChannelPayload) {
    // validation
    validateChannel(payload);
    // get current data in local storage
    const allChannels = JSON.parse(localStorage.getItem("channels") || "{}");
    localStorage.setItem(
      "channels",
      JSON.stringify({ ...allChannels, [channelId]: payload })
    );
  },
};
