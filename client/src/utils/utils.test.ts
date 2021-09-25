import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { nanoid } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import {
  convertTimestampToDate,
  fetchChannelDetailPayload,
  getChannelMessages,
  getMemberSummary,
  getNumberWithTwoDigits,
  getUserSearchSuggestions,
  validateChannel,
  validateChannelsPayload,
  validateMessage,
  validateMessages,
  validateSearchSuggestionUser,
} from "./utils";

// mocking partials
jest.mock("./validators", () => ({
  validateData: (data: any) => {
    if (data) return data;
    throw new Error("error!!!!");
  },
}));

// mock getData
jest.mock("./network.ts", () => ({
  getData: (url: string) => {
    if (/\/api\/user\?q\=fail/g.test(url)) {
      return {
        detail: "failed",
        users: [{ id: "xx-xx-xx-xx" }],
      };
    }
    if (/\/api\/user\?q\=/g.test(url)) {
      return {
        detail: "success",
        users: [{ id: "xx-xx-xx-xx" }],
      };
    }
    if (/\/api\/channel\/id02/g.test(url)) throw new Error("Error from server");
    return {
      channel: { id: "xx-xx-xx-xx" },
      messages: [{ id: "zz-zz-zz-zz" }],
    };
  },
}));

describe("getNumberWithTwoDigists", () => {
  it("should return value", () => {
    expect.assertions(2);
    expect(getNumberWithTwoDigits(1)).toEqual("01");
    expect(getNumberWithTwoDigits(11)).toEqual("11");
  });
});

describe("convertTimestampToDate", () => {
  it("should return date string", () => {
    expect.assertions(2);
    expect(convertTimestampToDate(1631407621765)).toEqual(
      "2021-09-12 00:47:01 AM"
    );
    expect(convertTimestampToDate(1631457621765)).toEqual(
      "2021-09-12 14:40:21 PM"
    );
  });
});

describe("validateChannel", () => {
  it("should return data", () => {
    expect.assertions(1);
    expect(validateChannel({})).toEqual({});
  });

  it("should throw an error if validateData() throw it", () => {
    expect.assertions(1);
    try {
      validateChannel(false);
    } catch (e) {
      if (e instanceof Error) expect(e.message).toEqual("error!!!!");
    }
  });
});

describe("validateMessage", () => {
  it("should return data", () => {
    expect.assertions(1);
    expect(validateMessage({})).toEqual({});
  });

  it("should throw an error if validateData() throw it", () => {
    expect.assertions(1);
    try {
      validateMessage(false);
    } catch (e) {
      if (e instanceof Error) expect(e.message).toEqual("error!!!!");
    }
  });
});

describe("validateMessages", () => {
  it("should return data", () => {
    expect.assertions(1);
    const data = [true, true, true];
    expect(validateMessages(data)).toEqual(data);
  });

  it("should throw an error if it's not an array", () => {
    expect.assertions(1);
    try {
      validateMessages(false);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          "validateMessages: data is not an array - false"
        );
    }
  });
});

describe("validateChannelsPayload", () => {
  it("should return data", () => {
    expect.assertions(1);
    const data = { channels: [true, true, true] };
    expect(validateChannelsPayload(data)).toEqual(data);
  });

  it("should throw an error if it's not an array", () => {
    expect.assertions(1);
    try {
      validateChannelsPayload(false);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          "validateChannelsPayload: invalid data.channels prop"
        );
    }
  });
});

describe("validateSearchSuggestionUser", () => {
  it("should return data", () => {
    expect.assertions(1);
    expect(validateSearchSuggestionUser({})).toEqual({});
  });

  it("should throw an error if validateData() throw it", () => {
    expect.assertions(1);
    try {
      validateSearchSuggestionUser(false);
    } catch (e) {
      if (e instanceof Error) expect(e.message).toEqual("error!!!!");
    }
  });
});

describe("getChannelMessages", () => {
  it("should return channel and messages", async () => {
    expect.assertions(1);
    expect(await getChannelMessages(uuid())).toEqual({
      channel: { id: "xx-xx-xx-xx" },
      messages: [{ id: "zz-zz-zz-zz" }],
    });
  });

  it("should throw an error if channel ID is invalid", async () => {
    expect.assertions(1);
    try {
      await await getChannelMessages("xxxx");
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          "getChannelMessages: invalid channel ID - xxxx"
        );
    }
  });
});

describe("getUserSearchSuggestions", () => {
  it("should return an array of users", async () => {
    expect.assertions(1);
    expect(await getUserSearchSuggestions("qqqq")).toEqual([
      { id: "xx-xx-xx-xx" },
    ]);
  });

  it("should throw an error if it gets invalid response from server", async () => {
    expect.assertions(1);
    try {
      await getUserSearchSuggestions("fail");
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual(
          "getUserSearchSuggestions: invalid response from server. detail: failed"
        );
    }
  });
});

describe("fetchChannelDetailPayload", () => {
  it("should return channel data", async () => {
    expect.assertions(1);
    expect(await fetchChannelDetailPayload("id01")).toEqual({
      id: "xx-xx-xx-xx",
    });
  });

  it("should throw an error if it gets invalid response from server", async () => {
    expect.assertions(1);
    try {
      await fetchChannelDetailPayload("id02");
    } catch (e) {
      if (e instanceof Error) expect(e.message).toEqual("Error from server");
    }
  });
});

describe("getMemberSummary", () => {
  let channelName: string;
  type User = { id: string; displayName: string };

  const getUser = (displayName: string): User => ({ id: uuid(), displayName });

  beforeEach(() => {
    channelName = nanoid();
  });

  it("should return channel name if member < 2", () => {
    expect.assertions(1);
    expect(getMemberSummary(channelName, [])).toEqual(channelName);
  });

  it("should return 2 users if member == 2", () => {
    expect.assertions(1);
    expect(
      getMemberSummary(channelName, [getUser("ALICE"), getUser("BOB")])
    ).toEqual("ALICE and BOB");
  });

  it("should retrun 2 users with number for other extra members", () => {
    expect.assertions(1);
    expect(
      getMemberSummary(channelName, [
        getUser("BOB"),
        getUser("ALICE"),
        getUser("CHRIS"),
        getUser("DANNY"),
      ])
    ).toEqual("BOB and ALICE + 2");
  });
});
