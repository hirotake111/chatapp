import dotenv from "dotenv";

dotenv.config();

export const env = {
  PROD: process.env.NODE_ENV === "production",
  SECRETKEY: process.env.SECRETKEY || "sssshhhiiiii",
  CALLBACKURL: process.env.CALLBACKURL || "http://localhost:3000/callback",
  ISSUER: process.env.ISSUER || "https://example.com",
  OAUTH_CLIENTID: process.env.OAUTH_CLIENTID || "myid",
  OAUTH_CLIENTSECRET: process.env.OAUTH_CLIENTSECRET || "mypass",
  KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID || "myapp",
  KAFKA_BROKERS: process.env.KAFKA_BROKERS || "localhost:9029",
  KAFKA_GROUP_ID: process.env.KAFKA_GROUP_ID || "mygroup",
  KAFKA_TOPIC_NAME: process.env.KAFKA_TOPIC_NAME || "mytopic",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:5379",
  PORT: process.env.PORT || "3000",
  HOSTNAME: process.env.HOSTNAME || "localhost",
  FRONTENDURL: process.env.FRONTENDURL || "http://localhost:3000",
  DATABASE_URI: process.env.DATABASE_URI || "postgres://localhost:5432/mydb",
};

export type Env = typeof env;
