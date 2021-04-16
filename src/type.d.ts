import express, { Request, Response } from "express";

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

type BaseController =
  // synchronous and asynchronous
  | ((req: Request, res: Response) => void)
  | ((req: Request, res: Reponse) => Promise<void>);

type SubController = {
  [key: string]: BaseController;
};

interface SubControllers {
  [key: string]: SubController;
}
