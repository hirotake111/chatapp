import { Request, Response } from "express";
import { BaseController } from "../type";
import { UserController } from "./userController";

type RootController = {
  getRoot: BaseController;
  getUserinfo: BaseController;
  user: UserController;
  // [key: string]: SubController;
};

type Controllers = {
  user: UserController;
};

export const getController = ({ user }: Controllers): RootController => ({
  getRoot: (req: Request, res: Response) => {
    res.status(200).send({ message: "OK" });
    return;
  },

  getUserinfo: (req: Request, res: Response) => {
    const { userId, username } = req.session;
    if (!username) {
      // UNAUTHORIZED response
      return res
        .status(401)
        .send({ mesaage: "UNAUTHORIZED", location: "/login" });
    }
    return res.status(200).send({ userId, username });
  },
  // user controller
  user,
});
