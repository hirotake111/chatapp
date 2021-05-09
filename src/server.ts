import express from "express";
import session from "express-session";
import { generators } from "openid-client";
import { Kafka } from "kafkajs";

import { config } from "./config";
import { getController } from "./controllers/controller";
import { useRoute } from "./router";
import { getDb } from "./utils/dbFactory";
import { User } from "./models/User.model";
import { getIssuer, getOIDCClient } from "./utils/oidc";
import { UserService } from "./services/user.service";
import { getUserController } from "./controllers/userController";

const app = express();
// Kafka producer/consumer
const kafka = new Kafka({
  clientId: config.KAFKA_CLIENT_ID,
  brokers: config.KAFKA_BROKERS,
});
const kafkaProducer = kafka.producer();
const kafkaConsumer = kafka.consumer({ groupId: config.KAFKA_GROUP_ID });

// Register SIGINT event
process.on("SIGINT", async () => {
  try {
    await kafkaProducer.disconnect();
    console.log("disconnected from Kafka cluster as a producer");
    await kafkaConsumer.disconnect();
    console.log("disconnected from Kafka cluster as a consumer");
  } catch (e) {
    throw e;
  }
});

(async () => {
  try {
    // middlewares
    app.use(
      session({
        secret: config.SECRETKEY,
        name: "chatappsessionid",
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 1000 * 60 * 5, // 5 minutes
          sameSite: "lax",
          secure: config.PROD,
        },
      })
    );

    // connect Kafka cluster
    await kafkaProducer.connect();
    console.log("connected to Kafka cluster as a producer.");
    await kafkaConsumer.connect();
    console.log("connected to Kafka cluster as a consumer.");
    await kafkaConsumer.subscribe({ topic: config.KAFKA_TOPIC_NAME });
    console.log(`subscribed topic ${config.KAFKA_TOPIC_NAME}`);

    // connect to database
    await getDb(config.DATABASE_URI, [User], config.SEQUELIZEOPTIONS);
    // connect to OIDC server
    const issuer = await getIssuer(config.ISSUER);
    const oidcClient = getOIDCClient(issuer, config.OAUTH_CLIENTMETADATA);
    // get controller
    const controller = getController({
      user: getUserController({ oidcClient, generators, UserService, config }),
    });
    // use router
    app.use(useRoute(controller));

    app.listen(config.PORT, () => {
      console.log(`http://${config.HOSTNAME}:${config.PORT}/userinfo`);
      console.log(`http://${config.HOSTNAME}:${config.PORT}/login`);
      console.log(config.FRONTENDURL);
    });
  } catch (e) {
    throw e;
  }
})();
