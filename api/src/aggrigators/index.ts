import { ConfigType } from "../config";
import { Services } from "../queries";
import { getRegisterUser } from "./userAggrigator";

export const getAggrigator = (config: ConfigType, services: Services) => {
  const registerUser = getRegisterUser(services.userService);

  return {
    listen: async () => {
      config.kafka.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log("==== GET MESSAGE FROM KAFKA ====");
          console.log({ partition, message: message.value?.toString() });
          // check topic
          console.log(`TOPIC: ${topic}`);
          switch (topic.toLowerCase()) {
            case "identity":
              registerUser(message);
              break;

            default:
              break;
          }
        },
      });
      console.log("==== consumers are now listening to each topic ====");
    },
  };
};
