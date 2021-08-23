import { PayloadAction } from "@reduxjs/toolkit";

type ChangeFormContentType = "message/changeFormContent";
type SendMessageType = "message/sendMessage";

/**
 * Payload Types
 */
export interface ChangeFormContentPayload {
  content: string;
}

export type SendMessagePayload = Message;

/**
 * Action Types
 */
interface ChangeFormContentActionType
  extends PayloadAction<ChangeFormContentPayload, ChangeFormContentType> {
  type: ChangeFormContentType;
  payload: ChangeFormContentPayload;
}

interface SendMessageActionType
  extends PayloadAction<SendMessagePayload, SendMessageType> {
  type: SendMessageType;
  payload: SendMessagePayload;
}

export type MessageActionTypes =
  | ChangeFormContentActionType
  | SendMessageActionType;

/**
 * Actions
 */
export const ChangeMessageBeenEditedAction = (
  payload: ChangeFormContentPayload
): ChangeFormContentActionType => ({
  type: "message/changeFormContent",
  payload,
});

export const SendMessageAction = (
  payload: SendMessagePayload
): SendMessageActionType => ({
  type: "message/sendMessage",
  payload,
});
