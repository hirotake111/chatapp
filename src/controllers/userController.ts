import { Request, Response } from "express";

import { Client, generators as Generators } from "openid-client";
import { UserServiceFactory } from "../services/user.service";
import { CALLBACKURL } from "../config";
import { ControllerSignature, CreateUserProps } from "../type";

export type UserController = {
  getLogin: ControllerSignature;
  getCallback: ControllerSignature;
};

export const getUserController = (
  oidcClient: Client,
  generators: typeof Generators,
  UserService: UserServiceFactory
): UserController => ({
  getLogin: async (req: Request, res: Response) => {
    try {
      // generate and store code verifier
      const codeVerifier = generators.codeVerifier();
      req.session.verifier = codeVerifier;
      // generate authorization URI
      const authzUrl = oidcClient.authorizationUrl({
        scope: "openid email profile",
        code_challenge: generators.codeChallenge(codeVerifier),
        code_challenge_method: "S256",
      });
      // return res.send("getLogin()");
      res.redirect(authzUrl);
      return;
    } catch (e) {
      // console.error(e);
      res.status(500).send({ error: "INTERNAL SERVER ERROR" });
      return;
    }
  },

  getCallback: async (req: Request, res: Response) => {
    try {
      // get token set from OIDC server
      const params = oidcClient.callbackParams(req);
      const tokenSet = await oidcClient.callback(CALLBACKURL, params, {
        code_verifier: req.session.verifier,
      });
      // get user info
      if (!tokenSet.access_token) {
        res
          .status(500)
          .send({ error: "Cannot fetch access token from OIDC server" });
        return;
      }
      const userInfo = await oidcClient.userinfo(tokenSet.access_token);
      // If user does not exists on database, create new one
      const user: CreateUserProps = {
        id: userInfo.sub,
        username: userInfo.name!,
        displayName: userInfo.display_name! as string,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
      };
      // console.log("userInfo: ", userInfo);
      // console.log("userpropps: ", user);

      // if user does not exist, store it in the database
      if (!(await UserService.getUserByUsername(user.username))) {
        // await UserService.createUser({ ...user });
        console.log("userregistered event sent.");
        // console.log("user created");
      } else {
        // console.log("user already exists.");
      }
      // store session
      req.session.username = userInfo.name;
      req.session.userId = userInfo.sub;
      // redirect to SPA root page
      res.redirect("/");
      return;
    } catch (e) {
      // console.error(e);
      res.status(500).send({ error: "INTERNAL SERVER ERROR" });
      return;
    }
  },
});
