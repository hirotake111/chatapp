import {
  asyncWait,
  getData,
  postData,
  getUserData,
  fetchMyChannels,
  fetchChannelDetailPayload,
} from "./network";
import { getFakeChannel, getFakeUser } from "./testHelpers";
import { validateData } from "./validators";

const mockRes = jest.fn();
// mock fetch API
global.fetch = (url: any, options: any) => {
  return Promise.resolve(mockRes());
};
// global.fetch = (url: any, options: any) => {
//   return Promise.resolve({
//     json: () => {
//       return new Promise((resolve, reject) => {
//         if (url === "/api/user/me") {
//           return resolve(mockJson());
//         }
//         return url ? resolve({ detail: "success" }) : reject("network error");
//       });
//     },
//     status:
//       url === "server" || url === "/api/user/me"
//         ? 200
//         : url === "redirect"
//         ? 401
//         : 400,
//   }) as any;
// };

// mock window.location.replace method
window = Object.create(window);
Object.defineProperty(window, "location", {
  value: { replace: jest.fn() },
});

// mock validators
jest.mock("./validators", () => ({
  validateData: (data: any) => data,
  validateChannelsPayload: (data: any) => data,
  validateChannel: (data: any) => data,
}));

beforeEach(() => {
  mockRes.mockClear();
});

describe("asyncWait", () => {
  it("should return passed value", async () => {
    expect.assertions(1);
    expect(await asyncWait(1000)).toEqual(true);
  });
});

describe("getData", () => {
  it("should return body", async () => {
    expect.assertions(1);
    const data = { detail: "success" };
    mockRes.mockImplementation(() => ({
      status: 200,
      json: () => Promise.resolve(data),
    }));
    expect(await getData("http://example.com")).toEqual(data);
  });

  it("should throw an error if network call failed", async () => {
    expect.assertions(1);
    const err = new Error("unknown error!");
    mockRes.mockImplementation(() => {
      throw err;
    });
    try {
      await getData("badserver");
    } catch (e) {
      expect(e).toEqual(err);
    }
  });

  it("should redirect user if response code is 401", async () => {
    expect.assertions(1);
    mockRes.mockImplementation(() => ({
      json: () => ({ body: { location: "http://othersite.com" } }),
      status: 401,
    }));
    try {
      await getData("redirect");
      expect(window.location.replace).toHaveBeenCalledTimes(1);
    } catch (e) {
      throw e;
    }
  });

  it("should throw an error if response code >=400 but other than 401", async () => {
    expect.assertions(1);
    mockRes.mockImplementation(() => ({
      json: () => Promise.resolve(),
      status: 400,
    }));
    try {
      await getData("redirect");
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual("Network error - status code: 400");
    }
  });
});

describe("postData", () => {
  it("should return body", async () => {
    expect.assertions(1);
    const mockBody = { detail: "success" };
    mockRes.mockImplementation(() => ({
      status: 200,
      json: () => Promise.resolve(mockBody),
    }));
    expect(await postData("server", { method: "POST" })).toEqual(mockBody);
  });

  it("should throw an error if network call failed", async () => {
    expect.assertions(1);
    const err = new Error("unknown error!");
    mockRes.mockImplementation(() => {
      throw err;
    });
    try {
      await postData("badserver", {});
    } catch (e) {
      expect(e).toEqual(err);
    }
  });

  it("should redirect user if response code s 401", async () => {
    expect.assertions(2);
    const body = { body: { location: "http://othersite.com" } };
    mockRes.mockImplementation(() => ({
      json: () => Promise.resolve(body),
      status: 401,
    }));
    try {
      expect(await postData("redirect", {})).toEqual(body);
      expect(window.location.replace).toHaveBeenCalledTimes(1);
    } catch (e) {
      throw e;
    }
  });

  it("should throw an error if response code >=400 but other than 401", async () => {
    expect.assertions(1);
    mockRes.mockImplementation(() => ({
      json: () => Promise.resolve(),
      status: 400,
    }));
    try {
      await postData("redirect", {});
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual("Network error - status code: 400");
    }
  });
});

describe("getUserData", () => {
  it("should get user data", async () => {
    expect.assertions(1);
    const userInfo = getFakeUser();
    mockRes.mockImplementation(() => ({
      status: 200,
      json: () => Promise.resolve(userInfo),
    }));
    expect(await getUserData()).toEqual(userInfo);
  });

  it("should throw an error if network call faield", async () => {
    expect.assertions(1);
    const err = new Error("network error!");
    mockRes.mockImplementation(() => {
      throw err;
    });
    try {
      await getUserData();
    } catch (e) {
      expect(e).toEqual(err);
    }
  });
});

describe("fetchMychannels", () => {
  it("should fetch channels payload from server", async () => {
    expect.assertions(1);
    const channels = [getFakeChannel(), getFakeChannel(), getFakeChannel()];
    mockRes.mockImplementation(() => ({
      status: 200,
      json: () => Promise.resolve({ channels }),
    }));
    expect(await fetchMyChannels()).toEqual(channels);
  });

  it("should raise an error if network call faield", async () => {
    expect.assertions(1);
    const err = new Error("network error!");
    mockRes.mockImplementation(() => {
      throw err;
    });
    try {
      await fetchMyChannels();
    } catch (e) {
      expect(e).toEqual(err);
    }
  });
});

describe("fetchChannelDetailPayload", () => {
  it("should return channel data", async () => {
    expect.assertions(1);
    const channel = getFakeChannel();
    mockRes.mockImplementation(() => ({
      status: 200,
      json: () => Promise.resolve({ channel }),
    }));
    expect(await fetchChannelDetailPayload(channel.id)).toEqual(channel);
  });

  it("should throw an error if it gets invalid response from server", async () => {
    expect.assertions(1);
    const err = new Error("xxxx");
    mockRes.mockImplementation(() => {
      throw err;
    });
    try {
      await fetchChannelDetailPayload("abcd");
    } catch (e) {
      expect(e).toEqual(err);
    }
  });
});
