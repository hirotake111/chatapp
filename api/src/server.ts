import { createServer } from "http";
import express, { NextFunction, Request } from "express";
import sessionMiddleware from "express-session";
import morgan from "morgan";
import { Server } from "socket.io";

import { getConfig } from "./config";
import { getController } from "./controllers/controller";
import { useRoute } from "./router";
import { getDb } from "./utils/db";
import { getAggrigator } from "./aggrigators";
import { getService } from "./services";
import { env } from "./env";
// import { ChatMessage } from "./type";

/** fake user db*/
interface fakeUserRecord {
  userId: string;
  username: string;
  channels: string[];
}
const fakeUserDb: fakeUserRecord[] = [
  {
    userId: "d46bb0db-9c41-4f40-84e7-d40acf560610",
    username: "alice",
    channels: ["channel1", "channel2"],
  },
  {
    userId: "83440b66-11a4-497f-83c4-beaf1eaef9c2",
    username: "test",
    channels: ["channel1", "channel3"],
  },
  {
    userId: "0d90e798-25d4-407c-afab-f08233cf0548",
    username: "bob",
    channels: ["channel1", "chennel2", "channel3"],
  },
];

/** fake function */
const getChannels = (userId: string) => {
  const record = fakeUserDb.filter((record) => record.userId === userId);
  return record.length ? record[0].channels : [];
};

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
    app.use(session); // session
    app.use(morgan("tiny")); // logger
    // session for WebSocket
    io.use((socket, next) => {
      const request = socket.request as Request;
      session(request, request.res!, next as NextFunction);
    });

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
      // validate user
      const { userId, username } = socket.request.session;
      if (!userId || !username) {
        console.log("user is not authenticated");
        socket.disconnect(true);
        return;
      }
      console.log(`authenticateduser: ${username} (${userId})`);

      // join room(s)
      const channels = getChannels(userId);
      console.log("Joining channels: ", channels);
      socket.join(channels);

      // handler for disconnection
      socket.on("disconnect", (data) => {
        console.log("client disconnected with data: ", data);
      });

      // message handler
      socket.on("chat message", (message: ChatMessage) => {
        console.log("Received message: ", message);
        const { username, userId } = socket.request.session;
        console.log("socket.handshake.auth: ", socket.handshake.auth);
        // check if user is authenticated
        if (!username || !userId) {
          socket.emit("chat message", {
            timestamp: Date.now(),
            content: "Not Authenticated",
          });
          return;
        }
        // check if authenticated user and sender info in payload is the same
        if (
          username !== message.sender.username ||
          userId !== message.sender.userId
        ) {
          socket.emit("chat message", {
            ...message,
            error: {
              code: 400, // bad request
              reason: "invalid username or user id",
            },
          } as ChatMessage);
        }
        // send members the message
        socket.to(message.channelId).emit("chat message", message);
        // socket.emit("chat message", message);
      });
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
