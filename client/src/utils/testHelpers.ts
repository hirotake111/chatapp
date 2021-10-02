import { nanoid } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

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
