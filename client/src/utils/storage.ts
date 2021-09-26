import { GetChannelMessagesPayload } from "../actions/channelActions";
import { validateChannel, validateMessages } from "./utils";

interface CustomStorage {
  getChannel(channelId: string): GetChannelMessagesPayload | {};
  setChannel(channelId: string, payload: GetChannelMessagesPayload): void;
}

interface ValueInChannelsKey {
  [key: string]: GetChannelMessagesPayload;
}

export const storage: CustomStorage = {
  /**
   * get data by channel ID from local storage. If not data in it, then return {}
   */
  getChannel(
    this: CustomStorage,
    channelId: string
  ): GetChannelMessagesPayload | {} {
    // get channels data
    const allChannels = JSON.parse(localStorage.getItem("channels") || "{}");
    // if fetched data is empty object, then return it as default value
    if (Object.keys(allChannels).length === 0) return {};
    const data: ValueInChannelsKey = allChannels[channelId];
    // else, it's not empty. validate channel and messages
    if (!data) return {};
    return {
      channel: validateChannel(data.channel),
      messages: validateMessages(data.messages),
    };
  },

  /**
   * set data using channel ID to local storage
   */
  setChannel(
    this: CustomStorage,
    channelId: string,
    payload: GetChannelMessagesPayload
  ) {
    // validation
    validateChannel(payload.channel);
    validateMessages(payload.messages);
    // get current data in local storage
    const allChannels = JSON.parse(localStorage.getItem("channels") || "{}");
    localStorage.setItem(
      "channels",
      JSON.stringify({ ...allChannels, [channelId]: payload })
    );
  },
};
