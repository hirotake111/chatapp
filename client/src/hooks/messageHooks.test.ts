import { nanoid } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import { ChangeMessageBeenEditedAction } from "../actions/messageActions";
import { getFakeChannel, getFakeMessageWithNoId } from "../utils/testHelpers";

import { useGetMessagesByChannelId, useSendMessage } from "./messageHooks";

// heloper function to generate returned state
const getFakeState = () => ({
  user: {
    isAuthenticated: true,
    userInfo: {
      userId: uuid(),
      username: nanoid(),
    },
  },
  channel: {
    highlighted: uuid(),
  },
});

const mockDispatch = jest.fn();
const mockUseAppSelector = jest.fn();
const mockEmit = jest.fn();
const mockConnect = jest.fn();
const mockGetChannemMessages = jest.fn();

// mock useAppDispatch
jest.mock("./reduxHooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (data: any) => mockUseAppSelector(data),
}));

// mock socket instance
jest.mock("../utils/ws/socket", () => ({
  socket: {
    connect: () => mockConnect(),
    emit: (eventName: string, message: any) => mockEmit(eventName, message),
  },
}));

// mock getChannelMessages
jest.mock("../utils/utils", () => ({
  getChannelMessages: (channelId: string) => mockGetChannemMessages(channelId),
}));

describe("useSendMessage", () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockEmit.mockClear();
  });

  it("shsould send message to server and empty form content", () => {
    expect.assertions(3);
    mockUseAppSelector.mockReturnValue(getFakeState());
    const send = useSendMessage();
    send("hello world");
    expect(mockEmit.mock.calls[0][0]).toEqual("chat message");
    expect(mockEmit.mock.calls[0][1].content).toEqual("hello world");
    expect(mockDispatch).toHaveBeenCalledWith(
      ChangeMessageBeenEditedAction({ content: "" })
    );
  });

  it("should not send message if content is empty", () => {
    expect.assertions(2);
    mockUseAppSelector.mockReturnValue(getFakeState());
    console.warn = jest.fn();
    const send = useSendMessage();
    send("");
    expect(console.warn).toHaveBeenCalledWith("message is empty - aborted");
    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });

  it("should not send message if user is not authenticated", () => {
    expect.assertions(2);
    mockUseAppSelector.mockReturnValue({
      ...getFakeState(),
      user: { isAuthenticated: false },
    });
    console.warn = jest.fn();
    const send = useSendMessage();
    send("hey");
    expect(console.warn).toHaveBeenCalledWith("you are probably not signed in");
    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });

  it("should not send message if highlighted is falsy value", () => {
    expect.assertions(2);
    mockUseAppSelector.mockReturnValue({
      ...getFakeState(),
      channel: { highlighted: undefined },
    });
    console.warn = jest.fn();
    const send = useSendMessage();
    send("hey");
    expect(console.warn).toHaveBeenCalledWith("prop highlighted is undefined");
    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });
});

describe("useGetMessagesByChannelId", () => {
  let get: (channelId: string) => void;

  beforeEach(() => {
    mockDispatch.mockClear();
    mockEmit.mockClear();
    get = useGetMessagesByChannelId();
  });

  it("should get channel messages and dispatch an action", async () => {
    expect.assertions(2);
    // set fake return value (channel)
    const channel = getFakeChannel();
    mockGetChannemMessages.mockReturnValue(channel);
    // call the function
    await get(channel.id);
    // 1st dispatch should be highlightChannel
    expect(mockDispatch.mock.calls[0][0]).toEqual({
      type: "channel/highlightChannel",
      payload: { channelId: channel.id },
    });
    // 2nd should be getChannelMessages
    expect(mockDispatch.mock.calls[1][0]).toEqual({
      type: "channel/getChannelMessages",
      payload: channel,
    });
  });

  it("should display log if network call failed", async () => {
    expect.assertions(1);
    // mock console.error
    console.error = jest.fn();
    const err = new Error("network error!");
    mockGetChannemMessages.mockImplementation(() => {
      throw err;
    });
    await get("xx-xx-xx-xx");
    expect(console.error).toHaveBeenCalledWith(err);
  });
});
