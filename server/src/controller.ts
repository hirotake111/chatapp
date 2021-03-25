import { Request, Response } from "express";

const userDatamock = {
  id: "abcd-abcd-abcd-abcd",
  username: "test user",
};

export const getRoot = (req: Request, res: Response) => {
  res.send("OK");
};

export const getUserinfo = (req: Request, res: Response) => {
  res.send(userDatamock);
};
