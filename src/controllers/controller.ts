import { Request, Response } from "express";
import { Client } from "openid-client";
import { UserServiceFactory } from "../services/user.service";

import { getUserController } from "./userController";

interface IUserData {
  id: string;
  username: string;
}
const userDatamock: IUserData = {
  id: "abcd-abcd-abcd-abcd",
  username: "test  user",
};

export interface ControllerReturnType {
  getRoot: (req: Request, res: Response) => Response;
  getUserinfo: (req: Request, res: Response) => Response;
  user: {
    getLogin: (req: Request, res: Response) => Promise<void | Response>;
    getCallback: (req: Request, res: Response) => Promise<void | Response>;
  };
}

export const getController = (
  oidcClient: Client,
  UserService: UserServiceFactory
): ControllerReturnType => ({
  getRoot: (req: Request, res: Response) => {
    return res.status(200).send({ message: "OK" });
  },

  getUserinfo: (req: Request, res: Response) => {
    const { userId: id, username } = req.session;
    if (!username) {
      // UNAUTHORIZED response
      return res
        .status(401)
        .send({ mesaage: "UNAUTHORIZED", location: "/login" });
    }
    return res.send({ id, username } as IUserData);
  },
  user: getUserController(oidcClient, UserService),
});
