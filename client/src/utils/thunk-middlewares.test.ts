import { v4 as uuid } from "uuid";

import {
  thunkAddCandidateToExistingChannel,
  thunkAddSuggestedUser,
  thunkChangeFormContent,
  thunkOnChatMessage,
  thunkRemoveCandidateFromExistingChannel,
  thunkUpdateMemberCandidateSearchStatus,
  thunkUpdateMemberModal,
  thunkUpdateSearchStatus,
} from "./thunk-middlewares";
import { store } from "./store";
import { getFakeChannel } from "./testHelpers";

const mockSuggestedUser: SearchedUser = {
  id: uuid(),
  username: "Megan",
  displayName: "Megan Bowen",
};

const mockChannel: ChannelPayload = {
  id: "02506229-0b68-419f-a52c-2faa422c7a74",
  name: "my channel1",
  createdAt: 1632103004274,
  updatedAt: 1632103004274,
  users: [
    {
      id: uuid(),
      displayName: "Tom",
    },
    mockSuggestedUser,
  ],
  messages: [],
};

const mockMessage: Message = {
  id: "fb629917-7a51-40e6-8ccb-8fc9820cdc6e",
  channelId: "02506229-0b68-419f-a52c-2faa422c7a74",
  content: "message",
  createdAt: 1632103004274,
  updatedAt: 1632103004274,
  sender: {
    username: "alice",
    id: "33a2b38b-b1bf-46f1-83da-76aaee617e5c",
    displayName: "ALICE",
  },
};

const mockMessages = [mockMessage];

let dispatch: any;

const mockGetChannel = (channeId: string) => ({ id: channeId });

const mockFetchMyChannel = jest.fn();
const mockFetchChannelDetailPayload = jest.fn();

beforeAll(() => {
  jest.mock("./storage", () => ({
    getChannel: mockGetChannel,
  }));
});

beforeEach(() => {
  dispatch = jest.fn();
  mockFetchMyChannel.mockClear();
  mockFetchChannelDetailPayload.mockClear();
});

// mock getData
jest.mock("./network", () => ({
  getData: (url: string): any | undefined => {
    if (url === "/api/user/me")
      return {
        userId: "33a2b38b-b1bf-46f1-83da-76aaee617e5c",
        username: "alice",
        displayName: "ALICE",
      };
    if (url.match(/^\/api\/user\?q\=/))
      return {
        detail: "success",
        users: [mockSuggestedUser],
      };
    if (url.match(/^\/api\/channel\/.+\/message$/))
      return {
        channel: mockChannel,
        messages: mockMessages,
      };
    if (url.match(/^\/api\/channel\/$/))
      return {
        channels: [mockChannel],
      };
    if (url.match(/^\/api\/channel\//)) return { channel: mockChannel };
  },
  postData: (url: string) => {
    if (url === "/api/channel")
      return {
        channelId: "xx-xx-xx-xx",
      };
  },
  fetchMyChannels: () => mockFetchMyChannel(),
  fetchChannelDetailPayload: () => mockFetchChannelDetailPayload(),
}));

jest.mock("./ws/socket", () => ({
  socket: {
    connected: true,
    emit: (eventName: string, msg: Message) => {
      return null;
    },
  },
}));

describe("thunkChangeFormContent", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    await thunkChangeFormContent("message edited")(
      dispatch,
      store.getState,
      {}
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "message/changeFormContent",
      payload: { content: "message edited" },
    });
  });
});

describe("thunkOnChatMessage", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    await thunkOnChatMessage(mockMessage)(dispatch, store.getState, {});
    expect(dispatch).toHaveBeenCalledWith({
      type: "channel/receiveMessage",
      payload: mockMessage,
    });
  });
});

describe("thunkAddSuggestedUser", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    await thunkAddSuggestedUser(mockSuggestedUser)(
      dispatch,
      store.getState,
      {}
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "newChannel/updateSearchStatus",
      payload: { type: "searchDone" },
    });
  });
});

describe("thunkUpdateSearchStatus", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    jest.useFakeTimers();
    const mockRefObj = { current: { value: "xxxx" } } as any;
    await thunkUpdateSearchStatus(mockRefObj, [mockSuggestedUser])(
      dispatch,
      store.getState,
      {}
    );
    jest.runAllTimers();
    expect(dispatch).toHaveBeenCalledWith({
      type: "newChannel/updateSearchStatus",
      payload: {
        type: "searching",
      },
    });
    jest.runAllTimers();
    jest.useRealTimers();
  });
});

describe("thunkUpdateMemberModal", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    await thunkUpdateMemberModal(true)(dispatch, store.getState, {});
    expect(dispatch).toHaveBeenCalledWith({
      type: "channel/updateMemberModal",
      payload: { enabled: true },
    });
  });
});

describe("thunkUpdateMemberCandidateSearchStatus", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    const status: UserSearchStatus = { type: "notInitiated" };
    await thunkUpdateMemberCandidateSearchStatus(status)(
      dispatch,
      store.getState,
      {}
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "channel/UpdateSearchStatus",
      payload: {
        status,
      },
    });
  });
});

describe("thunkAddCandidateToExistingChannel", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    await thunkAddCandidateToExistingChannel(mockSuggestedUser)(
      dispatch,
      store.getState,
      {}
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "channel/addCandidateToExistingChannel",
      payload: {
        candidate: mockSuggestedUser,
      },
    });
  });
});

describe("thunkRemoveCandidateFromExistingChannel", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    await thunkRemoveCandidateFromExistingChannel(mockSuggestedUser)(
      dispatch,
      store.getState,
      {}
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "channel/removeCandidateFromExistingChannel",
      payload: { candidate: mockSuggestedUser },
    });
  });
});

// describe("thunkGetUserByQuery", () => {
//   it("should dispatch action payload", async () => {
//     expect.assertions(1);
//     await thunkGetUserByQuery(
//       "xxxx",
//       [{ id: uuid(), displayName: "asdmfkals", username: "sdddk" }],
//       mockChannel
//     )(dispatch, store.getState, {});
//     expect(dispatch).toHaveBeenCalledWith({
//       type: "",
//     });
//   });
// });
