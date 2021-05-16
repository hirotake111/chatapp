import { KafkaMessage } from "kafkajs";
import { UserService } from "../services/user.service";
import { RegisteredEvent } from "../type";

export const getRegisterUser = (userService: UserService) => {
  return async (message: KafkaMessage) => {
    // if message.value is empty, raise an error
    if (!message.value) {
      throw new Error("message.values is empty");
    }
    // parse message
    const event = JSON.parse(message.value.toString()) as RegisteredEvent;

    console.log("attributes: ", message.attributes);
    console.log("offset: ", message.offset);
    console.log("key: ", message.key);
    console.log("event: ", event);
    console.log("type: ", event.type);

    try {
      // check event type
      switch (event.type) {
        case "UserRegistered":
          console.log(
            `user "${event.data.username}" will be registered to the database`
          );
          // keep in mind the inserting a new record must be idemponent
          if (!(await userService.createUser({ ...event.data }))) {
            // If the user already exists, display a log message
            console.warn(
              `username ${event.data.username} already exists in the database.`
            );
          }
          break;

        default:
          break;
      }
    } catch (e) {
      throw e;
    }
  };
};
