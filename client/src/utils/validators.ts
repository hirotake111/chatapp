import { validate } from "uuid";
import { UserInfoType } from "../reducers/userReducer";

export const validateUserInfo = (data: any): UserInfoType => {
  if (!data) throw new Error("data is undefined");
  const info = data as UserInfoType;
  const { userId, username, displayName, firstName, lastName } = info;
  if (userId && !(typeof userId === "string" && validate(userId)))
    throw new Error("Invalid userId");
  if (username && typeof username !== "string")
    throw new Error("Invalid username");
  if (displayName && typeof displayName !== "string")
    throw new Error("Invalid displayName");
  if (firstName && typeof firstName !== "string")
    throw new Error("Invalid firstName");
  if (lastName && typeof lastName !== "string")
    throw new Error("Invalid lastName");
  return info;
};
