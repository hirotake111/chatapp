import { UserInfoType } from "../reducers/userReducer";
import {
  validateChannel,
  validateChannelsPayload,
  validateData,
} from "./validators";

/**
 * wait for given milliseconds asynchronously, then return it
 */
export const asyncWait = (
  milliseconds = 500,
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
      await asyncWait();
      return body;
    }
    if (res.status >= 400)
      throw new Error(`Network error - status code: ${res.status}`);
    return body;
  } catch (e) {
    throw e;
  }
};

export const postData = async (url: string, payload: object): Promise<any> => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await res.json();
    if (res.status === 401) {
      window.location.replace(body.location);
      // wait for a few seconds to prevent app from clashing with invalid body
      await asyncWait();
      return body;
    }
    if (res.status >= 400)
      throw new Error(`Network error - status code: ${res.status}`);
    return body;
  } catch (e) {
    throw e;
  }
};

/**
 * fetches user info data from server, validate it, then return it.
 */
export const getUserData = async (): Promise<UserInfoType> => {
  try {
    const body = await getData("/api/user/me");
    const userInfo = validateData<UserInfoType>(body, {
      userId: { type: "string", isUUID: true },
      username: { type: "string" },
      displayName: { type: "string" },
    });
    return userInfo;
  } catch (e) {
    throw e;
  }
};

/**
 * fetches channels from server, validte it then return it
 */
export const fetchMyChannels = async (): Promise<ChannelPayload[]> => {
  try {
    const body = await getData("/api/channel/");
    return validateChannelsPayload(body.channels);
  } catch (e) {
    throw e;
  }
};

/**
 * get channel data and validate it, then return it
 */
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

// /**
//  * try network call for specificed times
//  */
// export const fetchChannelDetailPayloadWith = (
//   count: number
// ): Promise<ChannelPayload> => {
//   return new Promise<ChannelPayload>((resolve, reject) => {
//     let channel: ChannelPayload;
//     const timer = setInterval(async () => {
//       // channel = await fetchChannelDetailPayload()
//       clearTimeout(timer);
//     }, 2000);
//   });
// };

export const asyncTimeInterval =
  <T>(func: (params: any) => Promise<T>) =>
  (maxCount: number, intervalMS: number, params: any): Promise<T> => {
    return new Promise((resolve, reject) => {
      let count = 0;
      const timer = setInterval(async () => {
        count++;
        func(params)
          .then((result) => {
            clearTimeout(timer);
            resolve(result);
          })
          .catch((e) => {
            console.error("function call thrown an error:", e);
            if (count >= maxCount) {
              clearTimeout(timer);
              reject(
                new Error(
                  `function call exceeded the number of maxCount: ${maxCount}`
                )
              );
            }
          });
      }, intervalMS);
    });
  };
