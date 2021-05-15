import dotenv from "dotenv";
import { Client, ClientMetadata, generators } from "openid-client";
import { SequelizeOptions } from "sequelize-typescript";
import { Consumer, Kafka, Producer } from "kafkajs";
import { Models } from "./models";
import User from "./models/User.model";
import Message from "./models/Message.model";
import Roster from "./models/Roster.model";
import Thread from "./models/Thread.model";
import { getIssuer, getOIDCClient } from "./utils/oidc";
import { SessionOptions } from "express-session";

dotenv.config();

export const getConfig = async (): Promise<ConfigType> => {
  const prod = process.env.NODE_ENV === "production";
  const secretkey = process.env.SECRETKEY || "sssshhhiiiii";

  const callbackUrl =
    process.env.CALLBACKURL || "http://localhost:3000/callback";
  const issuer = await getIssuer(process.env.ISSUER || "https://example.com");
  const metadata: ClientMetadata = {
    client_id: process.env.OAUTH_CLIENTID || "myid",
    client_secret: process.env.OAUTH_CLIENTSECRET || "mypass",
    redirect_uris: [callbackUrl],
    response_types: ["code"],
  };
  const kafkaInstance = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID || "myapp",
    brokers: process.env.KAFKA_BROKERS
      ? process.env.KAFKA_BROKERS.split(",").map((sv) => sv.replace(/\s/g, ""))
      : ["localhost:9029"],
  });
  const kafkaGroupId = process.env.KAFKA_GROUP_ID || "mygroup";
  const sequelizeoptions: SequelizeOptions = prod
    ? {
        logging: false,
        dialectOptions: {
          ssl: {
            requre: true,
            rejectUnauthorized: false,
          },
        },
      }
    : { logging: false };

  return {
    // basic configuration
    port: parseInt(process.env.PORT || "3000", 10),
    hostname: process.env.HOSTNAME || "localhost",
    secretkey,
    prod,

    // session configuration
    sessionOptions: {
      secret: secretkey,
      name: "chatappsessionid",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 5, // 5 minutes
        sameSite: "lax",
        secure: prod,
      },
    },

    // OAUTH / OIDC configuration
    oidc: {
      client: getOIDCClient(issuer, metadata),
      generators,
      callbackUrl,
      frontendUrl: process.env.FRONTENDURL || "http://localhost:3000",
    },

    // Kafka configuration
    kafka: {
      groupId: kafkaGroupId,
      topicName: process.env.KAFKA_TOPIC_NAME || "mytopic",
      producer: kafkaInstance.producer(),
      consumer: kafkaInstance.consumer({ groupId: kafkaGroupId }),
    },

    // Database configuration
    database: {
      databaseUri: process.env.DATABASE_URI || "postgres://localhost:5432/mydb",
      sequelizeoptions,
      // model configuration
      models: {
        User,
        Message,
        Roster,
        Thread,
      },
      modelPath: [__dirname + "/models/**/*.model.ts"],
    },
  };
};

export type ConfigType = {
  port: number;
  prod: boolean;
  hostname: string;
  secretkey: string;
  sessionOptions: SessionOptions;
  oidc: {
    client: Client;
    generators: typeof generators;
    frontendUrl: string;
    callbackUrl: string;
  };
  kafka: {
    groupId: string;
    topicName: string;
    producer: Producer;
    consumer: Consumer;
  };
  database: {
    databaseUri: string;
    sequelizeoptions: SequelizeOptions;
    models: Models;
    modelPath: string[];
  };
};
