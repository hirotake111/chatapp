import { Action, PayloadAction } from "@reduxjs/toolkit";

type ShowNewChannelModalType = "newChannel/showNewChannelModal";
type HideNewChannelModalType = "newChannel/hideNewChannelModal";

type AddSuggestedUserType = "newChannel/addSuggestedUser";
type RemoveSuggestedUserType = "newChannel/removeSuggestedUser";

type UpdateSearchStatusType = "newChannel/updateSearchStatus";

type CreateChannelType = "newChannel/createChannel";

type DeleteChannelType = "newChannel/deleteChannel";
type EnableCreateButtonType = "newChannel/enableCreateButton";
type DisableCreateButtonType = "newChannel/disableCreateButton";

type UpdateChannelNameType = "newChannel/updateChannelName";

type UpdateCreateChannelStatusType = "newChannel/updateCreateChannelStatus";

/**
 * Payload Types
 */
export interface RemoveSuggestedUserPayload {
  userId?: string;
}

export interface CreateChannelPayload {
  newChannel: ChannelPayload;
}

export interface DeleteChannelPayload {
  channelId: string;
}

export interface UpdateChannelNamePayload {
  channelName: string;
}

export interface UpdateCreateChannelStatusPayload {
  message: string;
}

/**
 * Action Types
 */
interface ShowNewChannelModalActionType
  extends Action<ShowNewChannelModalType> {
  type: ShowNewChannelModalType;
}

interface HideNewChannelModalActionType
  extends Action<HideNewChannelModalType> {
  type: HideNewChannelModalType;
}

interface AddSuggestedUserActionType
  extends PayloadAction<SearchedUser, AddSuggestedUserType> {
  type: AddSuggestedUserType;
  payload: SearchedUser;
}

interface RemoveSuggestedUserActionType
  extends PayloadAction<RemoveSuggestedUserPayload, RemoveSuggestedUserType> {
  type: RemoveSuggestedUserType;
  payload: RemoveSuggestedUserPayload;
}

interface UpdateSearchStatusActionType
  extends PayloadAction<UserSearchStatus, UpdateSearchStatusType> {
  type: UpdateSearchStatusType;
  payload: UserSearchStatus;
}

interface CreateChannelActionType
  extends PayloadAction<CreateChannelPayload, CreateChannelType> {
  type: CreateChannelType;
  payload: CreateChannelPayload;
}

interface DeleteChannelActionType
  extends PayloadAction<DeleteChannelPayload, DeleteChannelType> {
  type: DeleteChannelType;
  payload: DeleteChannelPayload;
}

interface EnableCreateButtonActionType extends Action<EnableCreateButtonType> {
  type: EnableCreateButtonType;
}
interface DisableCreateButtonActionType
  extends Action<DisableCreateButtonType> {
  type: DisableCreateButtonType;
}

interface UpdateChannelNameActionType
  extends PayloadAction<UpdateChannelNamePayload, UpdateChannelNameType> {
  type: UpdateChannelNameType;
  payload: UpdateChannelNamePayload;
}

interface UpdateCreateChannelStatusActionType
  extends PayloadAction<
    UpdateCreateChannelStatusPayload,
    UpdateCreateChannelStatusType
  > {
  type: UpdateCreateChannelStatusType;
  payload: UpdateCreateChannelStatusPayload;
}

export type NewChannelActionTypes =
  | ShowNewChannelModalActionType
  | HideNewChannelModalActionType
  | AddSuggestedUserActionType
  | RemoveSuggestedUserActionType
  | UpdateSearchStatusActionType
  | CreateChannelActionType
  | DeleteChannelActionType
  | EnableCreateButtonActionType
  | DisableCreateButtonActionType
  | UpdateChannelNameActionType
  | UpdateCreateChannelStatusActionType;

/**
 * Actions
 */
export const ShowNewChannelModalAction = (): ShowNewChannelModalActionType => ({
  type: "newChannel/showNewChannelModal",
});

export const hideNewChannelModalAction = (): HideNewChannelModalActionType => ({
  type: "newChannel/hideNewChannelModal",
});

export const AddSuggestedUserAction = (
  payload: SearchedUser
): AddSuggestedUserActionType => ({
  type: "newChannel/addSuggestedUser",
  payload,
});

export const RemoveSuggestedUserAction = (
  userId: string
): RemoveSuggestedUserActionType => ({
  type: "newChannel/removeSuggestedUser",
  payload: { userId },
});

export const RemoveAllSuggestedUsersAction =
  (): RemoveSuggestedUserActionType => ({
    type: "newChannel/removeSuggestedUser",
    payload: {},
  });

export const UpdateSearchStatusAction = (
  payload: UserSearchStatus
): UpdateSearchStatusActionType => ({
  type: "newChannel/updateSearchStatus",
  payload,
});

export const CreateChannelAction = (
  newChannel: ChannelPayload
): CreateChannelActionType => ({
  type: "newChannel/createChannel",
  payload: { newChannel },
});

export const DeleteChannelAction = (
  channelId: string
): DeleteChannelActionType => ({
  type: "newChannel/deleteChannel",
  payload: { channelId },
});

export const EnableCreateButtonAction = (): EnableCreateButtonActionType => ({
  type: "newChannel/enableCreateButton",
});

export const DisableCreateButtonAction = (): DisableCreateButtonActionType => ({
  type: "newChannel/disableCreateButton",
});

export const UpdateChannelNameAction = (
  channelName: string
): UpdateChannelNameActionType => ({
  type: "newChannel/updateChannelName",
  payload: { channelName },
});

export const UpdateCreateChannelStatusAction = (
  message: string
): UpdateCreateChannelStatusActionType => ({
  type: "newChannel/updateCreateChannelStatus",
  payload: { message },
});
