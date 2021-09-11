import { validate } from "uuid";

import {
  GetChannelDetailPayload,
  GetMyChannelsPayload,
  GetChannelMessagesPayload,
} from "../actions/channelActions";
import { TypeToBeValidated, validateData } from "./validators";

const getNumberWithTwoDigits = (n: number): string =>
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

export const validateMessages = (data: any): Message[] => {
  if (!Array.isArray(data))
    throw new Error(
      `validation erorr: data is not an array - ${JSON.stringify(data)}`
    );
  data.forEach((elm) => {
    validateMessage(elm);
  });
  return data as Message[];
};

/**
 * validates payload and returns it.
 * If invalid, then throw an error
 * @param data {any}
 * @returns {GetChannelDetailPayload}
 */
export const validateGetChannelDetailPayload = (
  data: any
): GetChannelDetailPayload => {
  // detail

  return validateData<GetChannelDetailPayload>(data, {
    detail: { type: "string" },
    channel: { type: "parent", child: {} },
  });
};

export const validateGetMyChannelsPayload = (
  data: any
): GetMyChannelsPayload => {
  const { detail, channels }: { detail: string; channels: any[] } = data;
  // detail
  if (!(detail && typeof data.detail === "string"))
    throw new Error(`invalid detail property`);
  // channels
  if (!(data.channels && Array.isArray(data.channels)))
    throw new Error(`invalid channels property`);
  // if channels is empty, then return []
  if (channels.length === 0) return { channels };
  const { id, name, createdAt, updatedAt, users } = channels[0];
  // channel.id
  if (!(id && typeof id === "string"))
    throw new Error(`invalid channel.id property`);
  // channel.name
  if (!(name && typeof name === "string"))
    throw new Error(`invalid channel.name property`);
  /**
   * need to change type of createdAt and updatedAt on server end
   */
  // channel.createdAt
  if (!createdAt) throw new Error(`invalid channel.createdAt property`);
  // channel.updatedAt
  if (!updatedAt) throw new Error(`invalid channel.updatedAt property`);
  // channel.users
  if (!(users && Array.isArray(users)))
    throw new Error(`invalid channel.users property`);
  return { channels };
};

export const getChannelMessages = async (
  channelId: string
): Promise<GetChannelMessagesPayload> => {
  // validate channnel ID
  if (!validate(channelId)) throw new Error(`invalid channel ID: ${channelId}`);
  try {
    // fetch messages by channel Id
    const res = await fetch(`/api/channel/${channelId}/message`);
    const { channel, messages } = await res.json();
    if (res.status >= 400) {
      throw new Error(`error fetching data from server. code: ${res.status}`);
    }
    return {
      channel: validateChannel(channel),
      messages: validateMessages(messages),
    };
  } catch (e) {
    throw e;
  }
};

export const validateSearchSuggestionUser = (data: any): boolean => {
  const { id, username, displayName } = data;
  // id
  if (!(id && validate(id))) return false;
  // username
  if (!(username && typeof username === "string")) return false;
  // displayName
  if (!(displayName && typeof displayName === "string")) return false;
  return true;
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

/**
 * wait for given milliseconds asynchronously, then return it
 */
export const asyncWait = (
  milliseconds: number,
  value: any = true
): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), milliseconds);
  });
};

/**
 * gets data from server and returns body, or redirect to auth server when it gets HTTP 401
 */
export const getData = async (url: string): Promise<any> => {
  try {
    const res = await fetch(url);
    const body = await res.json();
    if (res.status === 401) {
      window.location.replace(body.location);
      // wait for a few seconds to prevent app from clashing with invalid body
      await asyncWait(1000);
      return body;
    }
    if (res.status >= 400)
      throw new Error(`Network error - status code: ${res.status}`);

    return body;
  } catch (e) {
    throw e;
  }
};
