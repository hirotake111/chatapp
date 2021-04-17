import express from "express";
import session from "express-session";
import { generators } from "openid-client";

import {
  HOSTNAME,
  PORT,
  SECRETKEY,
  PROD,
  ISSUER,
  FRONTENDURL,
  OAUTH_CLIENTMETADATA,
  DATABASE_URI,
  sequelizeOptions,
} from "./config";
import { getController } from "./controllers/controller";
import { useRoute } from "./router";
import { getDb } from "./utils/dbFactory";
import { User } from "./models/User.model";
import { getIssuer, getOIDCClient } from "./utils/oidc";
import { UserService } from "./services/user.service";
import { getUserController } from "./controllers/userController";

const app = express();

(async () => {
  try {
    // middlewares
    app.use(
      session({
        secret: SECRETKEY,
        name: "chatappsessionid",
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 1000 * 60 * 5, // 5 minutes
          sameSite: "lax",
          secure: PROD,
        },
      })
    );

    // connect to database
    await getDb(DATABASE_URI, [User], sequelizeOptions);
    // connect to OIDC server
    const issuer = await getIssuer(ISSUER);
    const client = getOIDCClient(issuer, OAUTH_CLIENTMETADATA);
    // get controller
    const controller = getController({
      user: getUserController(client, generators, UserService),
    });
    // use router
    app.use(useRoute(controller));

    app.listen(PORT, () => {
      console.log(`http://${HOSTNAME}:${PORT}/userinfo`);
      console.log(`http://${HOSTNAME}:${PORT}/login`);
      console.log(FRONTENDURL);
    });
  } catch (e) {
    throw e;
  }
})();
