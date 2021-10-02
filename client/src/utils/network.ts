import { UserInfoType } from "../reducers/userReducer";
import { validateData } from "./validators";

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
  const body = await getData("/api/user/me");
  const userInfo = validateData<UserInfoType>(body, {
    userId: { type: "string", isUUID: true },
    username: { type: "string" },
    displayName: { type: "string" },
  });
  return userInfo;
};
