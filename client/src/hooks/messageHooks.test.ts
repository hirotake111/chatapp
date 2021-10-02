import { getFakeChannel, getFakeMessageWithNoId } from "../utils/testHelpers";

import { useGetMessagesByChannelId, useSendMessage } from "./messageHooks";

const mockDispatch = jest.fn();
const mockEmit = jest.fn();
const mockConnect = jest.fn();
const mockGetChannemMessages = jest.fn();

// mock useAppDispatch
jest.mock("./reduxHooks", () => ({
  useAppDispatch: () => mockDispatch,
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
  let send: (message: MessageWithNoId) => void;

  beforeEach(() => {
    mockDispatch.mockClear();
    mockEmit.mockClear();
    send = useSendMessage();
  });

  it("shsould send message to server and empty form content", () => {
    expect.assertions(2);
    send(getFakeMessageWithNoId());
    expect(mockEmit.mock.calls[0][0]).toEqual("chat message");
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "message/changeFormContent",
      payload: { content: "" },
    });
  });

  it("should not send message if content is empty", () => {
    expect.assertions(2);
    console.warn = jest.fn();
    send({ ...getFakeMessageWithNoId(), content: "" });
    expect(console.warn).toHaveBeenCalledTimes(1);
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
