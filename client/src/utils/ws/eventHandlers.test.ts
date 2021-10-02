import { v4 as uuid } from "uuid";
import {
  GetChannelMessagesAction,
  ReceiveMessageAction,
} from "../../actions/channelActions";
import {
  getFakeChannel,
  getFakeMessage,
  getFakeMessageWithNoId,
} from "../testHelpers";
import { onChatMessage, onJoinedNewRoom } from "./eventHandlers";

const mockDispatch = jest.fn();
const mockFetch = jest.fn();

jest.mock("../utils", () => ({
  getChannelMessages: () => mockFetch(),
}));

beforeEach(() => {
  mockDispatch.mockClear();
  mockFetch.mockClear();
});

describe("onChatMessage", () => {
  it("should validate message and dispatch action", () => {
    expect.assertions(1);
    const data = getFakeMessage();
    onChatMessage(mockDispatch, data);
    expect(mockDispatch).toHaveBeenCalledWith(ReceiveMessageAction(data));
  });

  it("should throw an error if data is invalid", () => {
    expect.assertions(1);
    const data = getFakeMessageWithNoId();
    try {
      onChatMessage(mockDispatch, data);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual("validation error: data doesn't contain id");
    }
  });
});

describe("onJoinedNewRoom", () => {
  it("should fetch data from server and dispatch an action", async () => {
    expect.assertions(1);
    const channel = getFakeChannel();
    mockFetch.mockReturnValue(channel);
    await onJoinedNewRoom(mockDispatch, channel.id);
    expect(mockDispatch).toHaveBeenCalledWith(
      GetChannelMessagesAction(channel)
    );
  });

  it("should console.error if passed data (channelId is invalid", async () => {
    expect.assertions(1);
    console.error = jest.fn();
    await onJoinedNewRoom(mockDispatch, "abc");
    expect(console.error).toHaveBeenCalledWith(
      new Error(
        'invalid channelId was given on "joined a new room" event - abc'
      )
    );
  });

  it("should console.error if network call failed", async () => {
    expect.assertions(1);
    console.error = jest.fn();
    const err = new Error("network error");
    mockFetch.mockImplementation(() => {
      throw err;
    });
    await onJoinedNewRoom(mockDispatch, uuid());
    expect(console.error).toHaveBeenCalledWith(err);
  });
});
