import express from "express";
import session from "express-session";
import { Issuer } from "openid-client";

import { HOSTNAME, PORT, SECRETKEY, PROD, ISSUER, FRONTENDURL } from "./config";
import { getController } from "./controllers/controller";
import { useRoute } from "./router";

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
    const issuer = await Issuer.discover(ISSUER);
    const client = new issuer.Client({
      client_id: "myclient",
      client_secret: "secret",
      redirect_uris: ["http://localhost:8888/callback"],
      response_types: ["code"],
    });
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
