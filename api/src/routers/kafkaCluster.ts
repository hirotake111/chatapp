import { ConfigType } from "../config";

export const connectKafkaCluster = async (config: ConfigType) => {
  // connect Kafka cluster
  await config.kafka.producer.connect();
  console.log("==== connected to Kafka cluster as a producer. ====");
  await config.kafka.consumer.connect();
  console.log("==== connected to Kafka cluster as a consumer. ====");
  await config.kafka.consumer.subscribe({ topic: config.kafka.topicName });
  console.log(`==== subscribed topic "${config.kafka.topicName}" ====`);

  // Register SIGINT event
  process.on("SIGINT", async () => {
    try {
      await config.kafka.producer.disconnect();
      console.log("==== disconnected from Kafka cluster as a producer ====");
      await config.kafka.consumer.disconnect();
      console.log("==== disconnected from Kafka cluster as a consumer ====");
    } catch (e) {
      throw e;
    }
  });
};
