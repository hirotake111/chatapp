import express, { Request, Response, NextFunction } from "express";

interface SessionData {
  userId: string;
  username: string;
  verifier: string;
}
declare module "express-session" {
  interface SessionData {
    userId: string;
    username: string;
    verifier: string;
  }
}

declare module "http" {
  interface IncomingMessage {
    session: SessionData;
  }
}
declare module "socket.io" {
  interface IncomingMessage {}
  interface Socket {
    request: {
      session: SessionData;
    };
  }
}

export interface CreateUserProps {
  id: string;
  username: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
}

type ControllerSignature =
  // synchronous and asynchronous
  | ((req: Request, res: Response, next?: NextFunction) => void)
  | ((req: Request, res: Reponse, next?: NextFunction) => Promise<void>);

export interface RegisteredEventData {
  id: string;
  username: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisteredEvent {
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

export interface ChatMessage {
  sender: {
    username: string;
    userId: string;
  };
  timestamp: number;
  threadId: string;
  messageId: string;
  content: string;
  error?: {
    code: number;
    reason: string;
  };
}
