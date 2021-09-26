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
export const getData = async (url: string, waitFor = 1000): Promise<any> => {
  try {
    const res = await fetch(url);
    const body = await res.json();
    if (res.status === 401) {
      window.location.replace(body.location);
      // wait for a few seconds to prevent app from clashing with invalid body
      await asyncWait(waitFor);
      return body;
    }
    if (res.status >= 400)
      throw new Error(`Network error - status code: ${res.status}`);
    return body;
  } catch (e) {
    throw e;
  }
};

export const postData = async (
  url: string,
  payload: object,
  waitFor = 300
): Promise<any> => {
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
      await asyncWait(waitFor);
      return body;
    }
    if (res.status >= 400)
      throw new Error(`Network error - status code: ${res.status}`);
    return body;
  } catch (e) {
    throw e;
  }
};
