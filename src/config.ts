import dotenv from "dotenv";
import { ClientMetadata } from "openid-client";
import { SequelizeOptions } from "sequelize-typescript";

dotenv.config();

const PORT = parseInt(process.env.PORT || "3000", 10);
const HOSTNAME = process.env.HOSTNAME || "localhost";
const ISSUER = process.env.ISSUER || "https://example.com";
const SECRETKEY = process.env.SECRETKEY || "sssshhhiiiii";
const PROD = process.env.NODE_ENV === "production";
const CALLBACKURL = process.env.CALLBACKURL || "http://localhost:3000/callback";
const FRONTENDURL = process.env.FRONTENDURL || "http://localhost:3000";
const OAUTH_CLIENTMETADATA: ClientMetadata = {
  client_id: process.env.OAUTH_CLIENTID || "myid",
  client_secret: process.env.OAUTH_CLIENTSECRET || "mypass",
  redirect_uris: [CALLBACKURL],
  response_types: ["code"],
};
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || "myapp";
const KAFKA_BROKERS = process.env.KAFKA_BROKERS
  ? process.env.KAFKA_BROKERS.split(",").map((sv) => sv.replace(/\s/g, ""))
  : ["localhost:9029"];
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || "mygroup";
const KAFKA_TOPIC_NAME = process.env.KAFKA_TOPIC_NAME || "mytopic";

const DATABASE_URI =
  process.env.DATABASE_URI || "postgres://user:passlocalhost:5432/mydb";

const SEQUELIZEOPTIONS: SequelizeOptions = PROD
  ? {
      logging: false,
      dialectOptions: {
        ssl: {
          requre: true,
          rejectUnauthorized: false,
        },
      },
    }
  : { logging: console.log };

export const config = {
  PORT,
  PROD,
  HOSTNAME,
  ISSUER,
  SECRETKEY,
  FRONTENDURL,
  CALLBACKURL,
  OAUTH_CLIENTMETADATA,
  KAFKA_CLIENT_ID,
  KAFKA_BROKERS,
  KAFKA_GROUP_ID,
  KAFKA_TOPIC_NAME,
  DATABASE_URI,
  SEQUELIZEOPTIONS,
};

export type ConfigType = typeof config;
