import express from "express";

declare module "express-session" {
  interface SessionData {
    userId: string;
    username: string;
    verifier: string;
  }
}
