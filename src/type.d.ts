import express from "express";

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
