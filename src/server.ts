import express from "express";
import session from "express-session";

import {
  HOSTNAME,
  PORT,
  SECRETKEY,
  PROD,
  ISSUER,
  FRONTENDURL,
  OAUTH_CLIENTMETADATA,
  DATABASE_URI,
} from "./config";
import { getController } from "./controllers/controller";
import { useRoute } from "./router";
import { getDb } from "./utils/dbFactory";
import { User } from "./models/User.model";
import { getIssuer, getOIDCClient } from "./utils/oidc";
import { SequelizeOptions } from "sequelize-typescript";

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
    const options: SequelizeOptions = PROD
      ? {
          logging: false,
          dialectOptions: {
            ssl: {
              requre: true,
              rejectUnauthorized: false,
            },
          },
        }
      : { logging: console.log };
    // connect to database
    await getDb(DATABASE_URI, [User], options);
    // connect to OIDC server
    const issuer = await getIssuer(ISSUER);
    const client = getOIDCClient(issuer, OAUTH_CLIENTMETADATA);
    // get controller
    const controller = getController(client);
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
