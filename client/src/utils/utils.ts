import { validate } from "uuid";

import { getData } from "./network";
import { validateChannel, validateSearchSuggestionUser } from "./validators";

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
 * fetches messages by channel ID, validates it, then returns it
 */
export const getChannelMessages = async (
  channelId: string
): Promise<ChannelPayload> => {
  try {
    // validate channnel ID
    if (!validate(channelId))
      throw new Error(`getChannelMessages: invalid channel ID - ${channelId}`);
    // fetch messages by channel Id
    const { channel } = await getData(`/api/channel/${channelId}/message`);
    return validateChannel(channel);
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

/**
 * returns channel name, member names, or membernames with number
 */
export const getMemberSummary = (
  channelName: string,
  users: { id: string; displayName: string }[]
): string => {
  if (users.length < 2) {
    return channelName;
  }
  if (users.length === 2) {
    return `${users[0].displayName} and ${users[1].displayName}`;
  }
  return `${users[0].displayName} and ${users[1].displayName} + ${
    users.length - 2
  }`;
};
