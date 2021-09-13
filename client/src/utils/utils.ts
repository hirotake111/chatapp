import { validate } from "uuid";

import {
  GetMyChannelsPayload,
  GetChannelMessagesPayload,
} from "../actions/channelActions";
import { getData } from "./network";
import { TypeToBeValidated, validateData } from "./validators";

export const getNumberWithTwoDigits = (n: number): string =>
  n.toString().length === 1 ? "0" + n.toString() : n.toString();

export const convertTimestampToDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const yy = date.getFullYear();
  const mm = getNumberWithTwoDigits(date.getMonth() + 1);
  const dd = getNumberWithTwoDigits(date.getDate());
  const hh = getNumberWithTwoDigits(date.getHours());
  const mi = getNumberWithTwoDigits(date.getMinutes());
  const ss = getNumberWithTwoDigits(date.getSeconds());
  const ampm = date.getHours() < 13 ? "AM" : "PM";
  return `${yy}-${mm}-${dd} ${hh}:${mi}:${ss} ${ampm}`;
};

/**
 * validates channel data
 */
export const validateChannel = (data: any): ChannelPayload => {
  const customType: TypeToBeValidated = {
    id: { type: "string", isUUID: true },
    name: { type: "string" },
    createdAt: { type: "number" },
    updatedAt: { type: "number" },
    users: {
      type: "parent",
      isArray: true,
      child: {
        id: { type: "string", isUUID: true },
        displayName: { type: "string" },
      },
    },
  };
  const payload = validateData<ChannelPayload>(data, customType);
  return payload;
};

/**
 * valivates message data
 */
export const validateMessage = (data: any): Message => {
  const customType: TypeToBeValidated = {
    id: { type: "string", isUUID: true },
    channelId: { type: "string", isUUID: true },
    content: { type: "string" },
    createdAt: { type: "number" },
    updatedAt: { type: "number" },
    sender: {
      type: "parent",
      child: {
        id: { type: "string", isUUID: true },
        username: { type: "string" },
        displayName: { type: "string" },
      },
    },
  };
  return validateData<Message>(data, customType);
};

/**
 * validate an array of message data
 */
export const validateMessages = (data: any): Message[] => {
  if (!Array.isArray(data))
    throw new Error(
      `validateMessages: data is not an array - ${JSON.stringify(data)}`
    );
  data.forEach((elm) => {
    validateMessage(elm);
  });
  return data as Message[];
};

/**
 * validate an array of channel data
 */
export const validateChannelsPayload = (data: any): GetMyChannelsPayload => {
  if (!(data && data.channels && Array.isArray(data.channels)))
    throw new Error("validateChannelsPayload: invalid data.channels prop");
  // validate  channels prop
  data.channels.forEach((elm: any) => validateChannel(elm));
  return data as GetMyChannelsPayload;
};

/**
 * validates user data fetched from server
 */
export const validateSearchSuggestionUser = (data: any): SearchedUser => {
  const customType: TypeToBeValidated = {
    id: { type: "string", isUUID: true },
    username: { type: "string" },
    displayName: { type: "string" },
  };
  return validateData<SearchedUser>(data, customType);
};

/**
 * get channel messages by channel ID
 */
export const getChannelMessages = async (
  channelId: string
): Promise<GetChannelMessagesPayload> => {
  try {
    // validate channnel ID
    if (!validate(channelId))
      throw new Error(`getChannelMessages: invalid channel ID - ${channelId}`);
    // fetch messages by channel Id
    const { channel, messages } = await getData(
      `/api/channel/${channelId}/message`
    );
    return {
      channel: validateChannel(channel),
      messages: validateMessages(messages),
    };
  } catch (e) {
    throw e;
  }
};

/**
 * gets user data from server and returns an array of users
 */
export const getUserSearchSuggestions = async (
  query: string
): Promise<SearchedUser[]> => {
  const { detail, users } = await getData(`/api/user?q=${query}`);
  if (!(detail && detail === "success" && users && Array.isArray(users))) {
    throw new Error(
      `getUserSearchSuggestions: invalid response from server. detail: ${detail}`
    );
  }
  return users.map((user) => validateSearchSuggestionUser(user));
};

export const fetchChannelDetailPayload = async (
  channelId: string
): Promise<ChannelPayload> => {
  try {
    const body = await getData(`/api/channel/${channelId}`);
    // validate payload
    const payload = validateChannel(body.channel);
    return payload;
  } catch (e) {
    throw e;
  }
};
