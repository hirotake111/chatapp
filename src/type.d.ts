import express, { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    userId: string;
    username: string;
    verifier: string;
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
