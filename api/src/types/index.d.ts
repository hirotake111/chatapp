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

type ChatEventType =
  | "MessageCreated"
  | "MessageUpdated"
  | "MessageDeleted"
  | "ChannelCreated"
  | "ChannelDeleted"
  | "ChannelUpdated"
  | "UsersJoined"
  | "UsersRemoved"
  | "MessageAdded"
  | "OtherEvent";

declare interface ChatEvent {
  id: string;
  type: ChatEventType;
  metadata: {
    traceId: string;
    timestamp: number;
  };
  data: {
    addMessage?: {
      channelId: string;
      messageId: string;
      sender: {
        id: string;
        name: string;
      };
      content: string;
    };
    updateMessage?: {
      channelId: string;
      messageId: string;
      sender: {
        id: string;
        name: string;
      };
      content: string;
    };
    deleteMessage?: {
      channelId: string;
      messageId: string;
      sender: {
        id: string;
        name: string;
      };
    };
    createChannel?: {
      channelId: string;
      channelName: string;
      sender: {
        id: string;
        name: string;
      };
      memberIds: string[];
    };
    updateChannel?: {
      channelId: string;
      newChannelName: string;
      sender: {
        id: string;
        name: string;
      };
    };
    deleteChannel?: {
      channelId: string;
      sender: {
        id: string;
        name: string;
      };
    };
    addUsersToChannel?: {
      channelId: string;
      sender: {
        id: string;
        name: string;
      };
      memberIds: string[];
    };
    removeUsersFromChannel?: {
      channelId: string;
      sender: {
        id: string;
        name: string;
      };
      memberIds: string[];
    };
  };
}
