// import express, { Request, Response, NextFunction } from "express";
import "socket.io";
import "express-session";

declare module "express-session" {
  interface SessionData {
    userId: string;
    username: string;
    verifier: string;
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
