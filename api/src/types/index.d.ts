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

declare interface ChatMessage {
  sender: {
    username: string;
    userId: string;
  };
  timestamp: number;
  channelId: string;
  messageId: string;
  content: string;
  error?: {
    code: number;
    reason: string;
  };
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
  type: EventType;
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
