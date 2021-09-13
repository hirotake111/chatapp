interface SessionData {
  userId: string;
  username: string;
  verifier: string;
}

declare module "http" {
  interface IncomingMessage {
    session: SessionData;
  }
}

declare interface ChatPayload {
  sender: {
    name: string;
    id: string;
  };
  timestamp: number;
  channelId: string;
  messageId: string;
  content: string;
}

/**
 * Common interface for sendig/receiving message between server and client
 */
declare interface Message {
  id: string;
  channelId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  sender: {
    id: string;
    username: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
  };
}

declare interface ExceptionPayload {
  code: number;
  detail: string;
  timestamp: number;
}

declare interface CreateUserProps {
  id: string;
  username: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
}

declare interface RegisteredEventData {
  id: string;
  username: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
}

declare interface RegisteredEvent {
  id: string;
  type: string;
  metadata: {
    traceId: string;
    username: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    hash: string;
  };
  data: RegisteredEventData;
}

interface EventMetaData {
  traceId: string;
  timestamp: number;
}

interface Sender {
  id: string;
  username: string;
}

declare interface UsersJoinedEvent {
  type: "UsersJoined";
  metadata: EventMetaData;
  payload: {
    channelId: string;
    sender: Sender;
    memberIds: string[];
  };
}

declare interface UsersRemovedEvent {
  type: "UsersRemoved";
  metadata: EventMetaData;
  payload: {
    channelId: string;
    sender: Sender;
    memberIds: string[];
  };
}

declare interface MessageCreatedEvent {
  type: "MessageCreated";
  metadata: EventMetaData;
  payload: {
    channelId: string;
    messageId: string;
    sender: Sender;
    content: string;
  };
}

declare interface MessageUpdatedEvent {
  type: "MessageUpdated";
  metadata: EventMetaData;
  payload: {
    channelId: string;
    messageId: string;
    sender: Sender;
    content: string;
  };
}

declare interface MessageDeletedEvent {
  type: "MessageDeleted";
  metadata: EventMetaData;
  payload: {
    channelId: string;
    messageId: string;
    sender: Sender;
  };
}

declare interface ChannelCreatedEvent {
  type: "ChannelCreated";
  metadata: EventMetaData;
  payload: {
    channelId: string;
    channelName: string;
    sender: Sender;
    memberIds: string[];
  };
}

declare interface ChannelUpdatedEvent {
  type: "ChannelUpdated";
  metadata: EventMetaData;
  payload: {
    channelId: string;
    newChannelName: string;
    sender: Sender;
  };
}

declare interface ChannelDeletedEvent {
  type: "ChannelDeleted";
  metadata: EventMetaData;
  payload: {
    channelId: string;
    sender: Sender;
  };
}
declare type UsersEvents = UsersJoinedEvent | UsersRemovedEvent;
declare type MessageEvents =
  | MessageCreatedEvent
  | MessageUpdatedEvent
  | MessageDeletedEvent;

declare type ChannelEvents =
  | ChannelCreatedEvent
  | ChannelUpdatedEvent
  | ChannelDeletedEvent;

declare type EventTypes = UsersEvents | MessageEvents | ChannelEvents;
