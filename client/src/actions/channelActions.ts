import { Action, PayloadAction } from "@reduxjs/toolkit";

type GetChannelDetailType = "channel/fetchOneChannel";
type GetMyChannelsType = "channel/fetchChannels";
type GetChannelMessagesType = "channel/getChannelMessages";
type HighlightChannelType = "channel/highlightChannel";
type ReceiveMessageType = "channel/receiveMessage";
type UpdateMemberModalType = "channel/updateMemberModal";
type AddCandidateToExistingChannelType =
  "channel/addCandidateToExistingChannel";
type RemoveCandidateFromExistingChannelType =
  "channel/removeCandidateFromExistingChannel";
type ClearCandidateFromExistingChannelType =
  "channel/clearCandidateFromExistingChannel";
type UpdateMemberCandidateSearchStatusType = "channel/UpdateSearchStatus";
type UpdateMemberButtonEnabledType = "channel/UpdateMemberButtonEnabled";

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

export interface UpdateMemberModalPayload {
  enabled: boolean;
}

export interface AddCandidateToExistingChannelPayload {
  candidate: SearchedUser;
}

export interface RemoveCandidateFromExistingChannelPayload {
  candidate: SearchedUser;
}

export interface UpdateMemberCandidateSearchStatusPayload {
  status: UserSearchStatus;
}

export interface UpdateMemberButtonEnabledPayload {
  enabled: boolean;
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

interface UpdateMemberModalActionType
  extends PayloadAction<UpdateMemberModalPayload, UpdateMemberModalType> {
  type: UpdateMemberModalType;
  payload: UpdateMemberModalPayload;
}

interface AddCandidateToExistingChannelActionType
  extends PayloadAction<
    AddCandidateToExistingChannelPayload,
    AddCandidateToExistingChannelType
  > {
  type: AddCandidateToExistingChannelType;
  payload: AddCandidateToExistingChannelPayload;
}

interface RemoveCandidateFromExistingChannelActionType
  extends PayloadAction<
    RemoveCandidateFromExistingChannelPayload,
    RemoveCandidateFromExistingChannelType
  > {
  type: RemoveCandidateFromExistingChannelType;
  payload: RemoveCandidateFromExistingChannelPayload;
}

interface ClearCandidateFromExistingChannelActionType
  extends Action<ClearCandidateFromExistingChannelType> {
  type: ClearCandidateFromExistingChannelType;
}

interface UpdateMemberCandidateSearchStatusActionType
  extends PayloadAction<
    UpdateMemberCandidateSearchStatusPayload,
    UpdateMemberCandidateSearchStatusType
  > {
  type: UpdateMemberCandidateSearchStatusType;
  payload: UpdateMemberCandidateSearchStatusPayload;
}

interface UpdateMemberButtonEnabledActionType
  extends PayloadAction<
    UpdateMemberButtonEnabledPayload,
    UpdateMemberButtonEnabledType
  > {
  type: UpdateMemberButtonEnabledType;
  payload: UpdateMemberButtonEnabledPayload;
}

export type ChannelActionTypes =
  | GetChannelDetailActionType
  | GetMyChannelsActionType
  | GetChannelMessagesActionType
  | HighlightChannelActionType
  | ReceiveMessageActionType
  | UpdateMemberModalActionType
  | AddCandidateToExistingChannelActionType
  | RemoveCandidateFromExistingChannelActionType
  | ClearCandidateFromExistingChannelActionType
  | UpdateMemberCandidateSearchStatusActionType
  | UpdateMemberButtonEnabledActionType;

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

export const UpdateMemberModalAction = (
  enabled: boolean
): UpdateMemberModalActionType => ({
  type: "channel/updateMemberModal",
  payload: { enabled },
});

export const AddCandidateToExistingChannelAction = (
  candidate: SearchedUser
): AddCandidateToExistingChannelActionType => ({
  type: "channel/addCandidateToExistingChannel",
  payload: { candidate },
});

export const RemoveCandidateFromExistingChannelAction = (
  candidate: SearchedUser
): RemoveCandidateFromExistingChannelActionType => ({
  type: "channel/removeCandidateFromExistingChannel",
  payload: { candidate },
});

export const ClearCandidateFromExistingChannelAction =
  (): ClearCandidateFromExistingChannelActionType => ({
    type: "channel/clearCandidateFromExistingChannel",
  });

export const UpdateMemberCandidateSearchStatusAction = (
  status: UserSearchStatus
): UpdateMemberCandidateSearchStatusActionType => ({
  type: "channel/UpdateSearchStatus",
  payload: { status },
});

export const UpdateMemberButtonEnabledAction = (
  enabled: boolean
): UpdateMemberButtonEnabledActionType => ({
  type: "channel/UpdateMemberButtonEnabled",
  payload: { enabled },
});
