import { ChatConfigType } from "../config";
import { getRegisterUser } from "./userAggrigator";
import { Queries } from "../queries/query";
import { getChatAggrigator } from "./chatAggrigator";

export const getAggrigator = (config: ChatConfigType, queries: Queries) => {
  const userAggrigator = getRegisterUser(queries.userQuery);
  const chatAggrigator = getChatAggrigator(queries);

  const aggrigator = {
    listen: async () => {
      config.kafka.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          // console.log("==== GET MESSAGE FROM KAFKA ====");
          // console.log({ partition, message: message.value?.toString() });
          // console.log(`TOPIC: ${topic}`);

          // check topic
          switch (topic.toLowerCase()) {
            case "identity":
              userAggrigator(message);
              break;
            case "chat":
              chatAggrigator.process(message);
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
