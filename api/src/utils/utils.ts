import { validate } from "uuid";

/**
 * returns true if it's valid
 */
export const validateMessage = (data: Message): boolean => {
  const { id, sender, channelId, content, createdAt, updatedAt } = data;
  // sender field
  if (!sender) return false;
  // sender.id field
  if (!(sender.id && typeof sender.id === "string" && validate(sender.id)))
    return false;
  // sender.name field
  if (!(sender.username && typeof sender.username === "string")) return false;
  // createdAt field
  if (!(createdAt && typeof createdAt === "number")) return false;
  // updatedAt field
  if (!(updatedAt && typeof updatedAt === "number")) return false;
  // channelId field
  if (!(channelId && typeof channelId === "string" && validate(channelId)))
    return false;
  // messageId field
  if (!(id && typeof id === "string" && validate(id))) return false;
  // content field
  if (!(content && typeof content === "string")) return false;

  return true;
};
