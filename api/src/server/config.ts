import { ClientMetadata, generators } from "openid-client";
import { SequelizeOptions } from "sequelize-typescript";
import { Kafka } from "kafkajs";
import User from "../chats/models/User.model";
import Message from "../chats/models/Message.model";
import Roster from "../chats/models/Roster.model";
import Channel from "../chats/models/Channel.model";
import { getIssuer, getOIDCClient } from "../utils/oidc";
import session, { SessionOptions } from "express-session";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import { Env } from "./env";
import { ChatConfigType } from "../chats/config";

export const getConfig = async (env: Env): Promise<ConfigType> => {
  try {
    const issuer = await getIssuer(env.ISSUER);
    const metadata: ClientMetadata = {
      client_id: env.OAUTH_CLIENTID,
      client_secret: env.OAUTH_CLIENTSECRET,
      redirect_uris: [env.CALLBACK_URL],
      response_types: ["code"],
    };
    const kafkaInstance = new Kafka({
      clientId: env.KAFKA_CLIENT_ID,
      brokers: env.KAFKA_BROKERS.split(",").map((sv) => sv.replace(/\s/g, "")),
    });
    const kafkaGroupId = env.KAFKA_GROUP_ID;
    const sequelizeoptions: SequelizeOptions = env.PROD
      ? {
          logging: false,
          dialectOptions: {
            ssl: {
              requre: true,
              rejectUnauthorized: false,
            },
          },
        }
      : {
          logging: false,
        };

    const redisUrl = env.REDIS_URL;
    const redisSessionStore = connectRedis(session);
    const sessionStore = new redisSessionStore({ client: new Redis(redisUrl) });

    return {
      // basic configuration
      port: parseInt(env.PORT, 10),
      hostname: env.HOSTNAME,
      prod: env.PROD,

      // session configuration
      sessionOptions: {
        secret: env.SECRETKEY,
        name: "chatappsessionid",
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
          maxAge: 1000 * 60 * 120, // 120 minutes
          sameSite: "lax",
          secure: env.PROD,
        },
      },

      chat: {
        // OAUTH / OIDC configuration
        oidc: {
          client: getOIDCClient(issuer, metadata),
          generators,
          callbackUrl: env.CALLBACK_URL,
          frontendUrl: env.FRONTEND_URL,
        },

        // Kafka configuration
        kafka: {
          groupId: kafkaGroupId,
          topicName: env.KAFKA_TOPIC_NAME,
          producer: kafkaInstance.producer({ retry: { retries: 10 } }),
          consumer: kafkaInstance.consumer({ groupId: kafkaGroupId }),
        },

        // Database configuration
        database: {
          databaseUri: env.DATABASE_URI,
          sequelizeoptions,
          // model configuration
          modelPath: [User, Channel, Message, Roster],
          models: { User, Channel, Message, Roster },
        },

        // Redis configuration
        redis: {
          url: redisUrl,
          publisher: new Redis(redisUrl),
          subscriber: new Redis(redisUrl),
          sessionStore,
        },
      },
    };
  } catch (e) {
    throw e;
  }
};

export type ConfigType = {
  port: number;
  prod: boolean;
  hostname: string;
  sessionOptions: SessionOptions;
  chat: ChatConfigType;
  // oidc: {
  //   client: Client;
  //   generators: typeof generators;
  //   frontendUrl: string;
  //   callbackUrl: string;
  // };
  // kafka: {
  //   groupId: string;
  //   topicName: string;
  //   producer: Producer;
  //   consumer: Consumer;
  // };
  // database: {
  //   databaseUri: string;
  //   sequelizeoptions: SequelizeOptions;
  //   // models: Models;
  //   models: ModelCtor[];
  // };
  // redis: {
  //   url?: string;
  //   sessionStore: RedisStore;
  //   publisher: Redis.Redis;
  //   subscriber: Redis.Redis;
  // };
  // };
};
