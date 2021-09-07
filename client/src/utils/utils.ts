import { validate } from "uuid";

import {
  GetChannelDetailPayload,
  GetMyChannelsPayload,
  GetChannelMessagesPayload,
} from "../actions/channelActions";

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
  if (!(data.detail && typeof data.detail === "string"))
    throw new Error(`invalid detail property`);
  // channel
  if (!data.channel) throw new Error(`invalid channel property`);
  const { id, name, createdAt, updatedAt, users } = data.channel;
  // channel.id
  if (!(id && typeof id === "string"))
    throw new Error(`invalid channel.id property`);
  // channel.name
  if (!(name && typeof name === "string"))
    throw new Error(`invalid channel.name property`);
  // channel.createdAt
  if (!(createdAt && typeof createdAt === "number"))
    throw new Error(`invalid channel.createdAt property`);
  // channel.updatedAt
  if (!(updatedAt && typeof updatedAt === "number"))
    throw new Error(`invalid channel.updatedAt property`);
  // channel.users
  if (!(users && Array.isArray(users)))
    throw new Error(`invalid channel.users property`);
  return {
    detail: data.detail,
    channel: { id, name, createdAt, updatedAt, users, messages: [] },
  };
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
  if (channels.length === 0) return { detail, channels };
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
  return { detail, channels };
};

export const validateGetChannelMessagesPayload = (
  data: any
): GetChannelMessagesPayload => {
  const { detail, channel, messages } = data;
  // detail
  if (!(detail && typeof data.detail === "string"))
    throw new Error(`invalid detail property: ${detail}`);
  // channel
  if (!channel) throw new Error(`invalid channel property: ${channel}`);
  // channel.id
  if (!(channel.id && typeof channel.id === "string" && validate(channel.id)))
    throw new Error(`invalid channel.id property: ${channel.id}`);
  // channel.name
  if (!(channel.name && typeof channel.name === "string"))
    throw new Error(`invalid channel.name property: ${channel.name}`);
  // messages
  if (!(messages && Array.isArray(messages)))
    throw new Error(`invalid messages property: ${messages}`);
  // if messages has no items then return it
  const m = messages[0];
  if (!m) return { detail, channel, messages: [] };
  // message.id
  if (!(m.id && typeof m.id === "string" && validate(m.id)))
    throw new Error(`invalid message.id property: ${m.id}`);
  // message.channelId
  if (
    !(m.channelId && typeof m.channelId === "string" && validate(m.channelId))
  )
    throw new Error(`invalid message.channelId property: ${m.channelId}`);
  // message.content
  if (!(m.content && typeof m.content === "string"))
    throw new Error(`invalid message.content property: ${m.content}`);
  // message.sender
  if (!m.sender)
    throw new Error(`invalid message.sender property: ${m.sender}`);
  // message.sender.id
  if (
    !(m.sender.id && typeof m.sender.id === "string" && validate(m.sender.id))
  )
    throw new Error(`invalid message.sender.id property: ${m.sender.id}`);
  // message.sender.username
  if (!(m.sender.username && typeof m.sender.username === "string"))
    throw new Error(
      `invalid message.sender.username property: ${m.sender.username}`
    );
  // message.sender.displayName
  if (!(m.sender.displayName && typeof m.sender.displayName === "string"))
    throw new Error(
      `invalid message.sender.displayName property: ${m.sender.displayName}`
    );
  return {
    detail,
    channel,
    messages,
  };
};

export const getChannelMessages = async (
  channelId: string
): Promise<GetChannelMessagesPayload> => {
  // validate channnel ID
  if (!validate(channelId)) throw new Error(`invalid channel ID: ${channelId}`);
  try {
    // fetch messages by channel Id
    const res = await fetch(`/api/channel/${channelId}/message`);
    const body = await res.json();
    if (res.status >= 400) {
      throw new Error(`error fetching data from server. code: ${res.status}`);
    }
    // validate payload
    const payload = validateGetChannelMessagesPayload(body);
    return payload;
  } catch (e) {
    if (e instanceof Error) throw e;
    else throw e;
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
): Promise<GetChannelDetailPayload> => {
  try {
    // get channel detail from API server
    const response = await fetch(`/api/channel/${channelId}`);
    if (response.status >= 400)
      throw new Error(`error code: ${response.status}`);
    const body = await response.json();
    // validate payload
    return validateGetChannelDetailPayload(body);
  } catch (e) {
    throw e;
  }
};

/**
 * gets data from server and returns body, or redirect to auth server when it gets HTTP 401
 */
export const getData = async (url: string): Promise<any> => {
  try {
    const res = await fetch(url);
    const body = await res.json();
    if (res.status === 401) return window.location.replace(body.location);
    return body;
  } catch (e) {
    throw e;
  }
};
