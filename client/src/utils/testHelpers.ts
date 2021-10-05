import { nanoid } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";
import { RootState } from "./store";

/**
 * helper function to create fake user
 */
export const getFakeUser = (): {
  id: string;
  username: string;
  displayName: string;
} => ({
  id: uuid(),
  username: nanoid(),
  displayName: nanoid(),
});

/**
 * helper function to create message with no ID
 */
export const getFakeMessageWithNoId = (): MessageWithNoId => ({
  channelId: uuid(),
  sender: getFakeUser(),
  content: nanoid(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

/**
 * helper function to create message
 */
export const getFakeMessage = (): Message => ({
  ...getFakeMessageWithNoId(),
  id: uuid(),
});

/**
 * helper function to create fake channel payload with 3 users and 3 messages
 */
export const getFakeChannel = (): ChannelPayload => ({
  id: uuid(),
  name: nanoid(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  users: [getFakeUser(), getFakeUser(), getFakeUser()],
  messages: [getFakeMessage(), getFakeMessage(), getFakeMessage()],
});

/**
 * helper function to create fake state
 */
export const getFakeState = (): RootState => ({
  user: {
    isAuthenticated: true,
    userInfo: { userId: uuid(), username: nanoid(), displayName: nanoid() },
  },
  channel: {
    channels: [getFakeChannel(), getFakeChannel(), getFakeChannel()],
    memberModalEnabled: false,
    candidates: [getFakeUser(), getFakeUser()],
    suggestions: [getFakeUser()],
    addMemberButtonEnabled: false,
    searchStatus: { type: "notInitiated" },
    loading: true,
  },
  newChannel: {
    modal: true,
    selectedUsers: [getFakeUser(), getFakeUser()],
    channelName: "channel123",
    searchStatus: { type: "notInitiated" },
    buttonDisabled: true,
    createChannelStatusMessage: "xxx",
  },
  message: {
    content: "",
  },
});
