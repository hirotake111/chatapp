import { validate } from "uuid";

/**
 * returns ChatPaylaod, or null if input is invalid
 * @param data {any}
 * @returns {ChatPayload}
 */
export const validateChatPayload = (data: any): ChatPayload | null => {
  const { sender, timestamp, channelId, messageId, content } = data;
  // sender field
  if (!sender) return null;
  // sender.id field;
  if (!(sender.id && typeof sender.id === "string" && validate(sender.id)))
    return null;
  // sender.name field
  if (!(sender.name && typeof sender.name === "string")) return null;
  // timestamp field
  if (!(timestamp && typeof timestamp === "number")) return null;
  // channelId field
  if (!(channelId && typeof channelId === "string" && validate(channelId)))
    return null;
  // messageId field
  if (!(messageId && typeof messageId === "string" && validate(messageId)))
    return null;
  // content field
  if (!(content && typeof content === "string")) return null;

  return {
    timestamp,
    channelId,
    messageId,
    content,
    sender: { id: sender.id, name: sender.name },
  };
};
