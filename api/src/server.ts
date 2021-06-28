import { createServer } from "http";
import express, { Request, NextFunction } from "express";
import sessionMiddleware from "express-session";
import morgan from "morgan";
import { Server, Socket } from "socket.io";

import { getConfig } from "./config";
import { getController } from "./controllers/controller";
import { useRoute } from "./routers/router";
import { getDb } from "./utils/db";
import { getAggrigator } from "./aggrigators";
import { getQueries } from "./queries";
import { env } from "./env";
import { addWebSocketEventListener } from "./routers/websocketListener";
import { connectKafkaCluster } from "./routers/kafkaCluster";
import { getWSRouter } from "./utils/wsRouter";
import { getWSController } from "./controllers/wsController";

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
    app.use(morgan("tiny")); // logger

    // connect Kafka cluster
    connectKafkaCluster(config);

    // connect to database
    await getDb(config);

    // get service
    const queries = getQueries(config);
    // get controller
    const controller = getController(config, queries);
    // use router
    app.use(useRoute(controller));

    // register callbacks for Kafka topic
    getAggrigator(config, queries);

    // Websocket listener
    // addWebSocketEventListener(io, queries, session);

    // use session for WebSocket
    io.use((socket, next) => {
      const request = socket.request as Request;
      session(request, request.res!, next as NextFunction);
    });
    // WebSocket controller
    const wsController = getWSController(queries);
    // use WebSocket router
    const wsRouter = getWSRouter<ChatMessage>(io);
    wsRouter.onConnect(wsController.onConnection);
    wsRouter.on("chat message", wsController.onChatMessage);
    wsRouter.on("disconnect", wsController.onDiscconect);

    http.listen(config.port, () => {
      console.log(`http://${config.hostname}:${config.port}/userinfo`);
      console.log(`http://${config.hostname}:${config.port}/login`);
      console.log(config.oidc.frontendUrl);
    });
  } catch (e) {
    throw e;
  }
})();
