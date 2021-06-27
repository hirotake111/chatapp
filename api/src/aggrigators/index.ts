import { ConfigType } from "../config";
import { Queries } from "../queries";
import { getRegisterUser } from "./userAggrigator";

export const getAggrigator = (config: ConfigType, queries: Queries) => {
  const registerUser = getRegisterUser(queries.userQuery);

  const aggrigator = {
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
  aggrigator.listen();
  return aggrigator;
};
