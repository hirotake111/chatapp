import { Consumer, Producer } from "kafkajs";

export const connectKafkaCluster = async (
  producer: Producer,
  consumer: Consumer,
  topicNames: string[]
) => {
  const tasks: Promise<void>[] = [];
  try {
    // Register SIGINT event
    process.on("SIGINT", async () => {
      try {
        await producer.disconnect();
        console.log("==== disconnected from Kafka cluster as a producer ====");
        await consumer.disconnect();
        console.log("==== disconnected from Kafka cluster as a consumer ====");
      } catch (e) {
        throw e;
      }
    });

    // connect Kafka cluster
    await producer.connect();
    console.log("==== connected to Kafka cluster as a producer. ====");
    await consumer.connect();
    console.log("==== connected to Kafka cluster as a consumer. ====");
    // subscribe all topics
    topicNames.forEach((topic) => {
      tasks.push(consumer.subscribe({ topic }));
      console.log(`==== subscribed topic "${topic}" ====`);
    });
    await Promise.all(tasks);
  } catch (e) {
    throw e;
  }
};
