import { KafkaMessage } from "kafkajs";
import { UserQuery } from "../queries/userQuery";

export const getRegisterUser = (userQuery: UserQuery) => {
  return async (message: KafkaMessage) => {
    // if message.value is empty, raise an error
    if (!message.value) {
      throw new Error("message.values is empty");
    }
    // parse message
    const event = JSON.parse(message.value.toString()) as RegisteredEvent;
    console.log("aggrigator received an event:", event);
    try {
      // check event type
      switch (event.type) {
        case "UserRegistered":
          // keep in mind the inserting a new record must be idemponent
          if (!(await userQuery.createUser({ ...event.data }))) {
            // If the user already exists, display a log message
            console.log(
              `username "${event.data.username}" already exists in the database.`
            );
          }
          return;

        default:
          return;
      }
    } catch (e) {
      throw e;
    }
  };
};
