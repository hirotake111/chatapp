import { validate } from "uuid";

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
