import { Request, Response } from "express";
import { Client, generators as Generators } from "openid-client";

import { ConfigType } from "../config";
import { ControllerSignature } from "../type";
import { getUserController, UserController } from "./userController";
import { getService, Services } from "../services/";

export type RootController = {
  getRoot: ControllerSignature;
  getUserinfo: ControllerSignature;
  user: UserController;
};

// export const getController = ({ user }: Controllers): RootController => ({
//   getRoot: (req: Request, res: Response) => {
//     res.status(200).send({ message: "OK" });
//     return;
//   },

//   getUserinfo: (req: Request, res: Response) => {
//     const { userId, username } = req.session;
//     if (!username) {
//       // UNAUTHORIZED response
//       return res
//         .status(401)
//         .send({ mesaage: "UNAUTHORIZED", location: "/login" });
//     }
//     return res.status(200).send({ userId, username });
//   },
//   // user controller
//   user,
// });

export const getController = (
  config: ConfigType,
  services: Services
): RootController => {
  return {
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
    user: getUserController({
      oidcClient: config.oidc.client,
      generators: config.oidc.generators,
      userService: services.userService,
      config,
    }),
  };
};
