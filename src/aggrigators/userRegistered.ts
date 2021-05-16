import { KafkaMessage } from "kafkajs";
import { UserService } from "../services/user.service";
import { RegisteredEvent } from "../type";

export const getUserAggrigator = (userService: UserService) => {
  return async (message: KafkaMessage) => {
    console.log("attributes: ", message.attributes);
    console.log("value: ", message.value);
    console.log("offset: ", message.offset);
    console.log("key: ", message.key);
    // if message.value is empty, raise an error
    if (!message.value) {
      throw new Error("message.values is empty");
    }
    // parse message
    const event = JSON.parse(message.value.toString()) as RegisteredEvent;
    // if type is registered, then create a new record
    if (event.type === "registered") {
      const result = await userService.createUser({ ...event.data });
    }
    return;
    // keep in mind the inserting a new record must be idemponent
  };
};
