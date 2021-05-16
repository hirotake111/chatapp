import { KafkaMessage } from "kafkajs";
import { nanoid } from "nanoid";
import { UserService } from "../services/user.service";
import { RegisteredEvent } from "../type";
import { getRegisterUser } from "./userAggrigator";

const userService = {
  createUser: jest.fn().mockReturnValueOnce({ name: "testuser" }),
};
let message: KafkaMessage;
let event: RegisteredEvent;
let registerUser: (message: KafkaMessage) => Promise<void>;
let userServiceMock: jest.Mock;

const getMessage = (event: RegisteredEvent) => {
  return {
    key: Buffer.from(nanoid(), "utf-8"), // random bytes
    value: Buffer.from(JSON.stringify(event)), // random bytes
    timestamp: new Date().toISOString(), // formatted date
    size: Math.floor(Math.random() * 1024), // random number
    attributes: Math.floor(Math.random() * 100), // random number
    offset: nanoid(),
  };
};

describe("getRegisterUser", () => {
  beforeEach(() => {
    registerUser = getRegisterUser(userService as any);

    event = {
      id: nanoid(),
      type: "UserRegistered",
      metadata: {
        traceId: nanoid(),
        username: nanoid(),
        displayName: nanoid(),
        firstName: nanoid(),
        lastName: nanoid(),
        hash: nanoid(),
      },
      data: {
        id: nanoid(),
        username: nanoid(),
        displayName: nanoid(),
        firstName: nanoid(),
        lastName: nanoid(),
      },
    };

    message = getMessage(event);
  });

  it("should create a new user", async () => {
    expect.assertions(2);
    const createUserMock = userService.createUser as jest.Mock;
    try {
      await registerUser(message);
      expect(createUserMock).toHaveBeenCalledTimes(1);
      expect(createUserMock.mock.calls[0][0]).toEqual(event.data);
    } catch (e) {
      throw e;
    }
  });

  it("should finish normally if user already exists in the database", async () => {
    expect.assertions(1);
    // const createUserMock = userService.createUser as jest.Mock;
    try {
      await registerUser(message);
      expect(userService.createUser).toHaveBeenCalledTimes(1);
    } catch (e) {
      throw e;
    }
  });

  it("should raise an error if mesage.value is null", async () => {
    expect.assertions(1);
    message.value = null;
    try {
      await registerUser(message);
    } catch (e) {
      expect(e.message).toEqual("message.values is empty");
    }
  });

  it("should not create a new user if event.type is not UserRegistered", async () => {
    expect.assertions(1);
    const createUserMock = userService.createUser as jest.Mock;
    const message = getMessage({ ...event, type: "OtherType" });
    await registerUser(message);
    expect(createUserMock).toHaveBeenCalledTimes(0);
  });

  it("should raise an error", async () => {
    expect.assertions(1);
    const msg = "DATABASE ERROR!!!";
    try {
      userService.createUser = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      await registerUser(message);
    } catch (e) {
      expect(e.message).toEqual(msg);
    }
  });
});
