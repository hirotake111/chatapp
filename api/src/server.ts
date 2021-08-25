import { createServer } from "http";
import express, { Request, NextFunction } from "express";
import sessionMiddleware from "express-session";
import morgan from "morgan";
import { Server } from "socket.io";

import { getConfig } from "./server/config";
import { getController } from "./chats/controllers/controller";
import { getRouter } from "./server/router";
import { getDb } from "./utils/db";
import { getAggrigator } from "./chats/aggrigators/aggrigators";
import { getQueries } from "./chats/queries/query";
import { env } from "./server/env";
import { connectKafkaCluster } from "./server/kafkaCluster";
import { getWSController } from "./chats/controllers/wsController";
import { useWebSocketRoute } from "./chats/router";

const app = express();
const http = createServer(app);
const io = new Server(http, {
  cors: { origin: "http://localhost:8888" },
});

(async () => {
  try {
    // get config
    const config = await getConfig(env);

    // session middleware
    const session = sessionMiddleware(config.sessionOptions);
    // use middlewares
    app.use(express.json()); // body parser
    app.use(session); // session
    app.use(morgan("common")); // logger
    app.set("trust proxy", 1); // necessary as it is placed behind proxy server

    // connect Kafka cluster
    connectKafkaCluster(
      config.chat.kafka.producer,
      config.chat.kafka.consumer,
      [config.chat.kafka.topicName, "chat"]
    );

    // connect to database
    await getDb(
      config.chat.database.databaseUri,
      config.chat.database.modelPath,
      config.chat.database.sequelizeoptions
    );

    // get service
    const queries = getQueries(config.chat);
    // get controller
    const controller = getController(config.chat, queries);
    // get router
    const router = getRouter(controller);
    app.use(router);

    // register callbacks for Kafka topic
    getAggrigator(config.chat, queries);

    // use session for WebSocket
    io.use((socket, next) => {
      const request = socket.request as Request;
      session(request, request.res!, next as NextFunction);
    });
    // WebSocket controller
    const wsController = getWSController(config.chat, queries);
    // use WebSocket router
    useWebSocketRoute(io, wsController);

    http.listen(config.port, () => {
      console.log(`Linstening on port ${config.port}`);
    });
  } catch (e) {
    throw e;
  }
})();
