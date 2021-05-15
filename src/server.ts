import express from "express";
import session from "express-session";

import { getConfig } from "./config";
import { getController } from "./controllers/controller";
import { useRoute } from "./router";
import { getDb } from "./utils/db";
import { getAggrigators } from "./aggrigators";
import { getService } from "./services";

const app = express();

(async () => {
  try {
    // get config
    const config = await getConfig();

    // use middlewares
    app.use(session(config.sessionOptions));

    // connect Kafka cluster
    await config.kafka.producer.connect();
    console.log("==== connected to Kafka cluster as a producer. ====");
    await config.kafka.consumer.connect();
    console.log("==== connected to Kafka cluster as a consumer. ====");
    await config.kafka.consumer.subscribe({ topic: config.kafka.topicName });
    console.log(`==== subscribed topic "${config.kafka.topicName}" ====`);

    // Register SIGINT event
    process.on("SIGINT", async () => {
      try {
        await config.kafka.producer.disconnect();
        console.log("==== disconnected from Kafka cluster as a producer ====");
        await config.kafka.consumer.disconnect();
        console.log("==== disconnected from Kafka cluster as a consumer ====");
      } catch (e) {
        throw e;
      }
    });

    // create aggrigators
    const aggrigators = getAggrigators(config);

    // set callback for Kafka topic
    config.kafka.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log("==== GET MESSAGE FROM KAFKA ====");
        console.log({ topic, partition, message: message.value?.toString() });
      },
    });

    // connect to database
    await getDb(config);
    // get service
    const services = getService(config);
    // get controller
    const controller = getController(config, services);
    // use router
    app.use(useRoute(controller));

    app.listen(config.port, () => {
      console.log(`http://${config.hostname}:${config.port}/userinfo`);
      console.log(`http://${config.hostname}:${config.port}/login`);
      console.log(config.oidc.frontendUrl);
    });
  } catch (e) {
    throw e;
  }
})();
