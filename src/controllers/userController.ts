import { v4 as uuid } from "uuid";
import { Request, Response } from "express";
import { Client, generators as Generators } from "openid-client";
import { UserService } from "../services/user.service";
import { ConfigType } from "../config";
import { ControllerSignature, CreateUserProps, RegisteredEvent } from "../type";
import { ProducerRecord } from "kafkajs";
import { createHash } from "crypto";

export type UserController = {
  getLogin: ControllerSignature;
  getCallback: ControllerSignature;
};

interface Params {
  oidcClient: Client;
  generators: typeof Generators;
  userService: UserService;
  config: ConfigType;
}

export const getUserController = ({
  oidcClient,
  generators,
  userService,
  config,
}: Params): UserController => ({
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
      const tokenSet = await oidcClient.callback(
        config.oidc.callbackUrl,
        params,
        {
          code_verifier: req.session.verifier,
        }
      );
      // if no access token is obtained response HTTP 500
      const accessToken = tokenSet.access_token;
      if (!accessToken) {
        res
          .status(500)
          .send({ error: "Cannot fetch access token from OIDC server" });
        return;
      }
      // get user info
      const userInfo = await oidcClient.userinfo(accessToken);
      // If user does not exists on database, create new one
      const user: CreateUserProps = {
        id: userInfo.sub,
        username: userInfo.name!,
        displayName: userInfo.display_name! as string,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
      };

      // if user does not exist, store it in the database
      if (!(await userService.getUserByUsername(user.username))) {
        // await userService.createUser({ ...user });
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
        const record: ProducerRecord = {
          topic: config.kafka.topicName,
          messages: [{ value: JSON.stringify(event) }],
        };
        await config.kafka.producer.send(record);
        console.log("user created");
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
