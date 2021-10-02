import { validate } from "uuid";
import { GetMyChannelsPayload } from "../actions/channelActions";

type INumber = {
  type: "number";
  isArray?: boolean;
  maxLength?: number;
  minLength?: number;
};

type IString = {
  type: "string";
  isArray?: boolean;
  maxLength?: number;
  minLength?: number;
  isUUID?: boolean;
};

type Parent = {
  type: "parent";
  isArray?: boolean;
  child: { [key: string]: UnitTypes };
};

type IBoolean = {
  type: "boolean";
  isArray?: boolean;
};

type UnitTypes = INumber | IString | Parent | IBoolean;

export type TypeToBeValidated = {
  [key: string]: UnitTypes;
};

export const validateData = <T>(data: any, type: TypeToBeValidated): T => {
  const func = (currentData: any, currentType: TypeToBeValidated) => {
    Object.keys(currentType).forEach((key) => {
      const current = currentData[key];
      const typeInfo = currentType[key];
      // if current is undefined, throw an error
      if (current === undefined)
        throw new Error(`validation error: data doesn't contain ${key}`);
      // if isArray is true, then check the type of elements in it
      if (typeInfo.isArray) {
        if (!Array.isArray(current))
          throw new Error(
            `validation error: key "${key}" should be an array of "${typeInfo.type}" but not an array`
          );
        current.forEach((elm) => {
          if (typeInfo.type === "parent") {
            func(elm, typeInfo.child);
            return;
          }
          if (typeof elm !== typeInfo.type)
            throw new Error(
              `validation error: element of "${key}" should be of type "${
                typeInfo.type
              }" but "${typeof elm}"`
            );
        });
        return;
      }
      // if typeInfo.type is parent, then recursively validate
      if (typeInfo.type === "parent" && typeof current === "object") {
        func(current, typeInfo.child);
      }
      // if current exists but with wrong type, throw an error
      else if (typeInfo.type !== typeof current)
        throw new Error(
          `validation error: key "${key}" should be of type "${
            typeInfo.type
          }" but "${typeof current}"`
        );
      // UUID validation
      if (
        typeInfo.type === "string" &&
        typeInfo.isUUID === true &&
        !validate(current)
      )
        throw new Error(`validation error: key "${key}" must be UUIDv4`);
    });
    return currentData as T;
  };

  return func(data, type);
};

/**
 * validates channel data
 */
export const validateChannel = (data: any): ChannelPayload => {
  const customType: TypeToBeValidated = {
    id: { type: "string", isUUID: true },
    name: { type: "string" },
    createdAt: { type: "number" },
    updatedAt: { type: "number" },
    users: {
      type: "parent",
      isArray: true,
      child: {
        id: { type: "string", isUUID: true },
        displayName: { type: "string" },
      },
    },
  };
  const payload = validateData<ChannelPayload>(data, customType);
  return payload;
};

/**
 * valivates message data
 */
export const validateMessage = (data: any): Message => {
  const customType: TypeToBeValidated = {
    id: { type: "string", isUUID: true },
    channelId: { type: "string", isUUID: true },
    content: { type: "string" },
    createdAt: { type: "number" },
    updatedAt: { type: "number" },
    sender: {
      type: "parent",
      child: {
        id: { type: "string", isUUID: true },
        username: { type: "string" },
        displayName: { type: "string" },
      },
    },
  };
  return validateData<Message>(data, customType);
};

/**
 * validate an array of message data
 */
export const validateMessages = (data: any): Message[] => {
  if (!Array.isArray(data))
    throw new Error(
      `validateMessages: data is not an array - ${JSON.stringify(data)}`
    );
  data.forEach((elm) => {
    validateMessage(elm);
  });
  return data as Message[];
};

/**
 * validate an array of channel data
 */
export const validateChannelsPayload = (data: any): GetMyChannelsPayload => {
  if (!(data && data.channels && Array.isArray(data.channels)))
    throw new Error("validateChannelsPayload: invalid data.channels prop");
  // // validate  channels prop
  // data.channels.forEach((elm: any) => validateChannel(elm));
  // return data as GetMyChannelsPayload;
  const payload: GetMyChannelsPayload = { channels: [] };
  data.channels.forEach((ch: any) => {
    payload.channels.push(validateChannel(ch));
  });
  return payload;
};

/**
 * validates user data fetched from server
 */
export const validateSearchSuggestionUser = (data: any): SearchedUser => {
  const customType: TypeToBeValidated = {
    id: { type: "string", isUUID: true },
    username: { type: "string" },
    displayName: { type: "string" },
  };
  return validateData<SearchedUser>(data, customType);
};
