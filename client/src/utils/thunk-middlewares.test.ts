import { v4 as uuid } from "uuid";
import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  jest,
} from "@jest/globals";

import {
  thunkAddCandidateToExistingChannel,
  thunkAddSuggestedUser,
  thunkChangeFormContent,
  thunkCreateChannel,
  thunkGetChannelDetail,
  thunkGetChannelMessages,
  thunkGetMyChannels,
  thunkGetUserByQuery,
  thunkHideNewChannelModal,
  thunkHideSearchSuggestions,
  thunkHighlightChannel,
  thunkOnChatMessage,
  thunkRemoveCandidateFromExistingChannel,
  thunkRemoveSuggestedUser,
  thunkSendMessage,
  thunkShowNewChannelModal,
  thunkSignIn,
  thunkUpdateChannelName,
  thunkUpdateCreateButtonStatus,
  thunkUpdateMemberCandidateSearchStatus,
  thunkUpdateMemberModal,
  thunkUpdateSearchStatus,
} from "./thunk-middlewares";
import { store } from "./store";
import { UserInfoType } from "../reducers/userReducer";

const mockUserInfo: UserInfoType = {
  userId: "33a2b38b-b1bf-46f1-83da-76aaee617e5c",
  username: "alice",
  displayName: "ALICE",
};

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

beforeEach(() => {
  dispatch = jest.fn();
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
}));

jest.mock("./socket", () => ({
  socket: {
    connected: true,
    emit: (eventName: string, msg: Message) => {
      return null;
    },
  },
}));

describe("thunkSignIn", () => {
  it("should dispatch user info", async () => {
    expect.assertions(1);
    const signIn = thunkSignIn();
    await signIn(dispatch, store.getState, {});
    expect(dispatch).toHaveBeenCalledWith({
      type: "user/signedIn",
      payload: mockUserInfo,
    });
  });
});

describe("thunkGetChannelDetail", () => {
  it("should dispatch channel detail payload", async () => {
    expect.assertions(1);
    await thunkGetChannelDetail("xx-xx-xx-xx")(dispatch, () => ({} as any), {});
    expect(dispatch).toHaveBeenCalledWith({
      type: "channel/fetchOneChannel",
      payload: mockChannel,
    });
  });
});

describe("thunkGetMyChannels", () => {
  it("should dispatch GetMyChannelsAction", async () => {
    expect.assertions(1);
    await thunkGetMyChannels()(dispatch, store.getState, {});
    expect(dispatch).toHaveBeenCalledWith({
      type: "channel/fetchChannels",
      payload: {
        channels: [mockChannel],
      },
    });
  });
});

describe("thunkGetChannelMessages", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    await thunkGetChannelMessages(uuid())(dispatch, store.getState, {});
    expect(dispatch).toHaveBeenCalledWith({
      type: "channel/getChannelMessages",
      payload: { channel: mockChannel, messages: mockMessages },
    });
  });
});

describe("thunkHighlightChannel", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    await thunkHighlightChannel(mockChannel)(dispatch, store.getState, {});
    expect(dispatch).toHaveBeenCalledWith({
      type: "channel/highlightChannel",
      payload: mockChannel,
    });
  });
});

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

describe("thunkSendMessage", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    const payload: MessageWithNoId = {
      channelId: uuid(),
      sender: {
        id: uuid(),
        username: "BOB",
      },
      content: "hello world",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await thunkSendMessage(payload)(dispatch, store.getState, {});
    expect(dispatch).toHaveBeenCalledWith({
      type: "message/changeFormContent",
      payload: { content: "" },
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

describe("thunkShowNewChannelModal", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    await thunkShowNewChannelModal()(dispatch, store.getState, {});
    expect(dispatch).toHaveBeenCalledWith({
      type: "newChannel/showNewChannelModal",
    });
  });
});

describe("thunkHideNewChannelModal", () => {
  it("should dispatch action payload ", async () => {
    expect.assertions(1);
    await thunkHideNewChannelModal()(dispatch, store.getState, {});
    expect(dispatch).toHaveBeenCalledWith({
      type: "newChannel/hideNewChannelModal",
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

describe("thunkRemoveSuggestedUser", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    const userId = uuid();
    await thunkRemoveSuggestedUser(userId)(dispatch, store.getState, {});
    expect(dispatch).toHaveBeenCalledWith({
      type: "newChannel/removeSuggestedUser",
      payload: { userId },
    });
  });
});

describe("thunkHideSearchSuggestions", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    await thunkHideSearchSuggestions()(dispatch, store.getState, {});
    expect(dispatch).toHaveBeenCalledWith({
      type: "newChannel/updateSearchStatus",
      payload: { type: "notInitiated" },
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

describe("thunkUpdateCreateButtonStatus", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    const name = "mychannelxxxx";
    await thunkUpdateCreateButtonStatus(name, [mockSuggestedUser], true)(
      dispatch,
      store.getState,
      {}
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "newChannel/enableCreateButton",
    });
  });

  it("should dispatch action payload to disable button", async () => {
    expect.assertions(1);
    const name = "mychannelxxxx";
    await thunkUpdateCreateButtonStatus(name, [], false)(
      dispatch,
      store.getState,
      {}
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "newChannel/disableCreateButton",
    });
  });
});

describe("thunkCreateChannel", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    jest.useFakeTimers();
    await thunkCreateChannel("my channel abcd", [mockSuggestedUser])(
      dispatch,
      store.getState,
      {}
    );
    jest.runOnlyPendingTimers();
    expect(dispatch).toHaveBeenCalledWith({
      type: "newChannel/updateCreateChannelStatus",
      payload: {
        message: "Creating new channel...",
      },
    });
    jest.useRealTimers();
  });
});

describe("thunkUpdateChannelName", () => {
  it("should dispatch action payload", async () => {
    expect.assertions(1);
    await thunkUpdateChannelName("new channel name")(
      dispatch,
      store.getState,
      {}
    );
    expect(dispatch).toHaveBeenCalledWith({
      type: "newChannel/updateChannelName",
      payload: {
        channelName: "new channel name",
      },
    });
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
