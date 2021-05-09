import dotenv from "dotenv";
import { ClientMetadata } from "openid-client";
import { SequelizeOptions } from "sequelize-typescript";
import { Kafka } from "kafkajs";

dotenv.config();

export const PORT = parseInt(process.env.PORT || "3000", 10);
export const HOSTNAME = process.env.HOSTNAME || "localhost";
export const ISSUER = process.env.ISSUER || "https://example.com";
export const SECRETKEY = process.env.SECRETKEY || "sssshhhiiiii";
export const PROD = process.env.NODE_ENV === "production";
export const CALLBACKURL =
  process.env.CALLBACKURL || "http://localhost:3000/callback";
export const FRONTENDURL = process.env.FRONTENDURL || "http://localhost:3000";
export const OAUTH_CLIENTMETADATA: ClientMetadata = {
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
export const KAFKA_TOPIC_NAME = process.env.KAFKA_TOPIC_NAME || "mytopic";

export const DATABASE_URI =
  process.env.DATABASE_URI || "postgres://user:passlocalhost:5432/mydb";

export const sequelizeOptions: SequelizeOptions = PROD
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

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS,
});
export const kafkaProducer = kafka.producer();
export const kafkaConsumer = kafka.consumer({ groupId: KAFKA_GROUP_ID });
