import { PayloadAction } from "@reduxjs/toolkit";

type GetChannelDetailType = "channel/fetchOneChannel";
type GetMyChannelsType = "channel/fetchChannels";
type GetChannelMessagesType = "channel/getChannelMessages";
type HighlightChannelType = "channel/highlightChannel";
type ReceiveMessageType = "channel/receiveMessage";

/**
 * Payload Types
 */
export interface GetChannelDetailPayload {
  detail: string;
  channel: ChannelPayload;
}

export interface GetMyChannelsPayload {
  detail: string;
  channels: ChannelPayload[];
}

export interface GetChannelMessagesPayload {
  detail: string;
  channel: ChannelPayload;
  messages: Message[];
}

/**
 * Action Types
 */
interface GetChannelDetailActionType
  extends PayloadAction<GetChannelDetailPayload, GetChannelDetailType> {
  type: GetChannelDetailType;
  payload: GetChannelDetailPayload;
}

interface GetMyChannelsActionType
  extends PayloadAction<GetMyChannelsPayload, GetMyChannelsType> {
  type: GetMyChannelsType;
  payload: GetMyChannelsPayload;
}

interface GetChannelMessagesActionType
  extends PayloadAction<GetChannelMessagesPayload, GetChannelMessagesType> {
  type: GetChannelMessagesType;
  payload: GetChannelMessagesPayload;
}

interface HighlightChannelActionType
  extends PayloadAction<ChannelPayload, HighlightChannelType> {
  type: HighlightChannelType;
  payload: ChannelPayload;
}

interface ReceiveMessageActionType
  extends PayloadAction<Message, ReceiveMessageType> {
  type: ReceiveMessageType;
  payload: Message;
}

export type ChannelActionTypes =
  | GetChannelDetailActionType
  | GetMyChannelsActionType
  | GetChannelMessagesActionType
  | HighlightChannelActionType
  | ReceiveMessageActionType;

/**
 * Actions
 */
export const GetChannelDetailAction = (
  payload: GetChannelDetailPayload
): ChannelActionTypes => ({ type: "channel/fetchOneChannel", payload });

export const GetMyChannelsAction = (
  payload: GetMyChannelsPayload
): ChannelActionTypes => ({ type: "channel/fetchChannels", payload });

export const GetChannelMessagesAction = (
  payload: GetChannelMessagesPayload
): ChannelActionTypes => ({ type: "channel/getChannelMessages", payload });

export const HighlightChannelAction = (
  payload: ChannelPayload
): HighlightChannelActionType => ({
  type: "channel/highlightChannel",
  payload,
});

export const ReceiveMessageAction = (
  payload: Message
): ReceiveMessageActionType => ({
  type: "channel/receiveMessage",
  payload,
});
