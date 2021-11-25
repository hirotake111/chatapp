import { Client, generators } from "openid-client";
import { ModelCtor, SequelizeOptions } from "sequelize-typescript";
import { Consumer, Producer } from "kafkajs";
import Redis from "ioredis";
import { RedisStore } from "connect-redis";

import { Models } from "./models/models";
import { RedisAdapter } from "@socket.io/redis-adapter";

export type ChatConfigType = {
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
    modelPath: ModelCtor[];
  };
  redis: {
    url?: string;
    sessionStore: RedisStore;
    publisher: Redis.Redis;
    subscriber: Redis.Redis;
    redisAdapter: (nsp: any) => RedisAdapter;
  };
};
