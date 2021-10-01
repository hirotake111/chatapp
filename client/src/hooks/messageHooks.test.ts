import { nanoid } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

import { useSendMessage } from "./messageHooks";

let send: (message: MessageWithNoId) => void;
const mockDispatch = jest.fn();
const mockEmit = jest.fn();
const mockConnect = jest.fn();

// mock useAppDispatch
jest.mock("./reduxHooks", () => ({
  useAppDispatch: () => mockDispatch,
}));

// mock socket instance
jest.mock("../utils/socket", () => ({
  socket: {
    connect: () => mockConnect(),
    emit: (eventName: string, message: any) => mockEmit(eventName, message),
  },
}));

beforeEach(() => {
  mockDispatch.mockClear();
  mockEmit.mockClear();
  send = useSendMessage();
});

/**
 * helper function to create message with no ID
 */
const getMessage = (): MessageWithNoId => ({
  channelId: uuid(),
  sender: { id: uuid(), username: nanoid(), displayName: nanoid() },
  content: uuid(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

describe("useSendMessage", () => {
  it("shsould send message to server and empty form content", () => {
    expect.assertions(2);
    send(getMessage());
    expect(mockEmit.mock.calls[0][0]).toEqual("chat message");
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "message/changeFormContent",
      payload: { content: "" },
    });
  });

  it("should not send message if content is empty", () => {
    expect.assertions(2);
    console.warn = jest.fn();
    send({ ...getMessage(), content: "" });
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });
});
