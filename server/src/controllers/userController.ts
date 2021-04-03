import { Request, Response } from "express";
import { Client, generators } from "openid-client";
import { CALLBACKURL } from "../config";

export const getUserController = (oidcClient: Client) => ({
  getLogin: async (req: Request, res: Response) => {
    try {
      // generate and store code verifier
      const codeVerifier = generators.codeVerifier();
      req.session.verifier = codeVerifier;
      // generate authorization URI
      const authz_uri = oidcClient.authorizationUrl({
        scope: "openid email profile",
        code_challenge: generators.codeChallenge(codeVerifier),
        code_challenge_method: "S256",
      });
      // return res.send("getLogin()");
      return res.redirect(authz_uri);
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
