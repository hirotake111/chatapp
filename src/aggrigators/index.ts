import { ConfigType } from "../config";
import { getUserAggrigator } from "./userRegistered";

export const registerAggrigator = (config: ConfigType) => {
  config.kafka.consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log("==== GET MESSAGE FROM KAFKA ====");
      console.log({ topic, partition, message: message.value?.toString() });
    },
  });
};
