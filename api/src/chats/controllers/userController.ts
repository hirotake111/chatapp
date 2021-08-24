import { v4 as uuid, validate } from "uuid";
import { Request, Response, RequestHandler, NextFunction } from "express";
import { ProducerRecord } from "kafkajs";
import { createHash } from "crypto";

import { ChatConfigType } from "../config";
import { Queries } from "../queries/query";

export type UserController = {
  getLogin: RequestHandler;
  getCallback: RequestHandler;
  getUsers: RequestHandler;
  getUserInfo: RequestHandler;
};

export const getUserController = (
  config: ChatConfigType,
  queries: Queries
): UserController => {
  const { userQuery } = queries;
  return {
    getLogin: async (req: Request, res: Response, next: NextFunction) => {
      const { generators, client } = config.oidc;
      try {
        // generate and store code verifier
        const codeVerifier = generators.codeVerifier();
        req.session.verifier = codeVerifier;
        console.log("verifier:", codeVerifier);
        console.log("req.session:", req.session);
        const authzUrl = client.authorizationUrl({
          scope: "openid email profile",
          code_challenge: generators.codeChallenge(codeVerifier),
          code_challenge_method: "S256",
        });
        // return res.send("getLogin()");
        res.redirect(authzUrl);
        return;
      } catch (e) {
        // console.error(e);
        res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
        return;
      }
    },

    getCallback: async (req: Request, res: Response) => {
      const { client, callbackUrl } = config.oidc;
      try {
        // get token set from OIDC server
        const params = client.callbackParams(req);
        console.log("params:", params);
        console.log("req.session:", req.session);
        const cbChecks = { code_verifier: req.session.verifier };
        console.log("vefirier:", cbChecks);
        const tokenSet = await client.callback(callbackUrl, params, cbChecks);
        // if no access token is obtained response HTTP 500
        const accessToken = tokenSet.access_token;
        console.log("access token:", accessToken);
        if (!accessToken) {
          res
            .status(500)
            .send({ error: "Cannot fetch access token from OIDC server" });
          return;
        }
        // get user info
        const userInfo = await config.oidc.client.userinfo(accessToken);
        console.log("userInfo:", userInfo);
        // If user does not exists on database, create new one
        const user: CreateUserProps = {
          id: userInfo.sub,
          username: userInfo.name!,
          displayName: userInfo.display_name! as string,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
        };

        // if user does not exist, store it in the database
        console.log(
          "user eixsts in the database:",
          !!(await userQuery.getUserByUsername(user.username))
        );
        if (!(await userQuery.getUserByUsername(user.username))) {
          const event: RegisteredEvent = {
            id: uuid(),
            type: "UserRegistered",
            metadata: {
              traceId: uuid(),
              ...user,
              // hash will be later used to guarantee idempotence
              hash: createHash("sha256").update(accessToken).digest("base64"),
            },
            data: {
              ...user,
            },
          };
          console.log("event:", event);
          const record: ProducerRecord = {
            topic: config.kafka.topicName,
            messages: [{ value: JSON.stringify(event) }],
          };
          console.log("record:", record);
          console.log("before sending event");
          await config.kafka.producer.send(record);
          console.log("after sending event");
        }
        // store session
        req.session.username = user.username;
        req.session.userId = userInfo.sub;
        // redirect to SPA root page
        res.redirect("/");
        return;
      } catch (e) {
        res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
        return;
      }
    },

    /**
     * responds other users info, based on search query (if request has it)
     */
    getUsers: async (req: Request, res: Response) => {
      const { userId: requesterId } = req.session;
      const { q } = req.query;
      // validate query string
      if (typeof q !== "string" || q.length < 1)
        return res.status(400).send({ detail: "invalid query string" });
      console.log(q);
      // validate requester ID
      if (!validate(requesterId))
        return res.status(400).send({ detail: "invalid requester ID" });
      try {
        // get a list of other users
        const users = await userQuery.getOtherUsers(requesterId, q);
        res.status(200).send({
          detail: "success",
          users: users.map((user) => ({
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            firstname: user.firstName,
            lastName: user.lastName,
          })),
        });
        return;
      } catch (e) {
        res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
        return;
      }
    },

    getUserInfo: async (req: Request, res: Response) => {
      const { userId: requesterId } = req.session;
      // validate requesterId
      if (!validate(requesterId))
        return res.status(400).send({ detail: "invalid requester ID" });
      try {
        // get user info from db
        const userInfo = await userQuery.getUserById(requesterId);
        if (!userInfo)
          return res
            .status(400)
            .send({ detail: "couldn't retrieve user info with your ID" });
        const { username, displayName, firstName, lastName } = userInfo;
        return res.status(200).send({
          detail: "success",
          userId: requesterId,
          username,
          displayName,
          firstName,
          lastName,
        });
      } catch (e) {
        res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
        return;
      }
    },
  };
};
