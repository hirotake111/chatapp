import express from "express";
import session from "express-session";
import { Issuer } from "openid-client";

import {
  HOSTNAME,
  PORT,
  SECRETKEY,
  PROD,
  ISSUER,
  FRONTENDURL,
  CALLBACKURL,
  OAUTH_CLIENTMETADATA,
} from "./config";
import { getController } from "./controllers/controller";
import { useRoute } from "./router";
import { getIssuer, getOIDCClient } from "./utils/oidc";

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
