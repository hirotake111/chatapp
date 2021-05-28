import { createServer } from "http";
import express from "express";
import session from "express-session";
import morgan from "morgan";
import { Server } from "socket.io";

import { getConfig } from "./config";
import { getController } from "./controllers/controller";
import { useRoute } from "./router";
import { getDb } from "./utils/db";
import { getAggrigator } from "./aggrigators";
import { getService } from "./services";
import { env } from "./env";

const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: { origin: "http://localhost:8888" },
});

(async () => {
  try {
    // get config
    const config = await getConfig(env);

    // use middlewares
    app.use(session(config.sessionOptions));
    app.use(morgan("tiny")); // logger

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
    // const aggrigators = getAggrigators(config);

    // connect to database
    await getDb(config);
    // get service
    const services = getService(config);
    // get controller
    const controller = getController(config, services);
    // use router
    app.use(useRoute(controller));

    // register callbacks for Kafka topic
    const aggrigator = getAggrigator(config, services);
    aggrigator.listen();
    // config.kafka.consumer.run({
    //   eachMessage: async ({ topic, partition, message }) => {
    //     console.log("==== GET MESSAGE FROM KAFKA ====");
    //     console.log({
    //       topic,
    //       partition,
    //       "message.value": message.value?.toString(),
    //     });
    //   },
    // });

    // Websocket listener
    io.on("connection", (socket) => {
      console.log("==== WEBSOCKET CONNECTED ===");
      socket.on("disconnect", (data) => {
        console.log("client disconnected with data: ", data);
      });
      // console.log(socket);
      // socket.send("hello");
    });

    http.listen(config.port, () => {
      console.log(`http://${config.hostname}:${config.port}/userinfo`);
      console.log(`http://${config.hostname}:${config.port}/login`);
      console.log(config.oidc.frontendUrl);
    });
  } catch (e) {
    throw e;
  }
})();
