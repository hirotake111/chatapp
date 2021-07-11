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
    username: string;
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

declare interface ChatEvent {
  id: string;
  type: string;
  data: {
    message?: ChatPayload;
    channel?: {
      channelId: string;
      channelName: string;
      requesterId: string;
    };
    roster: {
      channelId: string;
      userId: string;
    };
  };
}
