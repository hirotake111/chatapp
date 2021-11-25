import {
  asyncWait,
  getData,
  postData,
  getUserData,
  fetchMyChannels,
  fetchChannelDetailPayload,
  asyncTimeInterval,
} from "./network";
import { getFakeChannel, getFakeUser } from "./testHelpers";

const mockRes = jest.fn();
// mock fetch API
global.fetch = () => {
  return Promise.resolve(mockRes());
};

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
    jest.useFakeTimers();
    const result = asyncWait(5000);
    jest.runOnlyPendingTimers();
    expect(await result).toEqual(true);
    jest.useRealTimers();
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

// describe("fetchChannelDetailPayloadWith", () => {
//   it("should stop loop and return channel", async () => {
//     expect.assertions(1);
//     const channel = getFakeChannel();
//     mockRes.mockReturnValue(channel);
//     const result = await fetchChannelDetailPayloadWith(3);
//     expect(mockRes).toHaveBeenCalledTimes(1);
//     expect(result).toEqual(channel);
//   });
// });

describe("asyncTimeInterval", () => {
  it("should call passed function one time and return data", async () => {
    expect.assertions(2);
    jest.useFakeTimers();
    const func1 = jest.fn();
    func1.mockResolvedValue(123);
    const func2 = asyncTimeInterval<number>(func1);
    const result = func2(3, 1000, 123);
    jest.runOnlyPendingTimers();
    expect(await result).toEqual(123);
    expect(func1).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it("should return data if the function return even if it failed for 1st attempt", async () => {
    expect.assertions(3);
    jest.useFakeTimers();
    const func1 = jest.fn();
    const tmp = console.error;
    console.error = jest.fn();
    func1
      .mockRejectedValueOnce("ERROR") // 1st time -> throw an error
      .mockRejectedValueOnce("ERROR") // 2nd time -> throw an error
      .mockResolvedValue(123); // 3rd time -> return value
    const func2 = asyncTimeInterval<number>(func1);
    const result = func2(3, 1000, 123);
    jest.runOnlyPendingTimers();
    jest.runOnlyPendingTimers();
    jest.runOnlyPendingTimers();
    expect(await result).toEqual(123);
    expect(func1).toHaveBeenCalledTimes(3);
    expect(console.error).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
    console.error = tmp;
  });

  it("should throw an error if function call exceeds maxCount times", async () => {
    expect.assertions(1);
    const tmp = console.error;
    console.error = jest.fn();
    jest.useFakeTimers();
    const func1 = jest.fn();
    func1
      .mockRejectedValueOnce("eeee")
      .mockRejectedValueOnce("eeee")
      .mockRejectedValueOnce("eeee")
      .mockRejectedValueOnce("eeee")
      .mockResolvedValue(1000);
    const func2 = asyncTimeInterval<number>(func1);
    try {
      const result = func2(3, 1000, {});
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();
      jest.runOnlyPendingTimers();
      await result;
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          "function call exceeded the number of maxCount: 3"
        );
    }
    jest.useRealTimers();
    console.error = tmp;
  });
});
