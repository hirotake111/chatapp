import { Request, Response } from "express";

import { Client, generators } from "openid-client";
import { UserServiceFactory } from "../services/user.service";
import { CALLBACKURL } from "../config";
import { CreateUserProps } from "../type";

export const getUserController = (
  oidcClient: Client,
  UserService: UserServiceFactory
) => ({
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
      return res.redirect(authzUrl);
    } catch (e) {
      // console.error(e);
      return res.status(500).send({ error: "INTERNAL SERVER ERROR" });
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
        throw new Error("Cannot fetch access token from OIDC server");
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
      console.log("userInfo: ", userInfo);
      console.log("userpropps: ", user);
      if (!(await UserService.getUserByUsername(user.username))) {
        await UserService.createUser({ ...user });
        console.log("user created");
      } else {
        console.log("user already exists.");
      }
      // store session
      req.session.username = userInfo.name;
      req.session.userId = userInfo.sub;
      // redirect to SPA root page
      return res.redirect("/");
    } catch (e) {
      console.error(e);
      res.status(500).send({ error: "INTERNAL SERVER ERROR" });
    }
  },
});
