import { MiddlewareAPI } from "@reduxjs/toolkit";
import { Middleware, Dispatch } from "redux";
import {
  ChannelActionTypes,
  ClearCandidateFromExistingChannelAction,
  GetChannelMessagesAction,
  GetMyChannelsAction,
  UpdateMemberButtonEnabledAction,
  UpdateMemberCandidateSearchStatusAction,
} from "../actions/channelActions";
import { MessageActionTypes } from "../actions/messageActions";
import {
  updateCreateButtonAction,
  NewChannelActionTypes,
  RemoveAllSuggestedUsersAction,
  UpdateChannelNameAction,
  UpdateCreateChannelStatusAction,
} from "../actions/newChannelActions";
import { UserActionTypes } from "../actions/userActions";
import { RootState } from "./store";
import { getChannelMessages } from "./utils";

export type ActionTypes =
  | ChannelActionTypes
  | UserActionTypes
  | MessageActionTypes
  | NewChannelActionTypes;
type DispatchType = Dispatch<ActionTypes>;

export const myMiddleware: Middleware =
  (storeApi: MiddlewareAPI<DispatchType, RootState>) =>
  (next: DispatchType) =>
  async (action: ActionTypes) => {
    /**
     * middleware before next()
     */
    if (action.type === "channel/updateMemberModal") {
      // remove candidates and set status as "notInitiated"
      storeApi.dispatch(ClearCandidateFromExistingChannelAction());
      storeApi.dispatch(
        UpdateMemberCandidateSearchStatusAction({ type: "notInitiated" })
      );
      storeApi.dispatch(UpdateMemberButtonEnabledAction(true));
    }
    next(action);
    /**
     * middlewarer after next()
     */
    if (action.type === "channel/fetchChannels") {
      // As "channel/fetchChannels" will be invoke at initial page load,
      // now highlighted channel is undefined,
      // so we will fetch all messages for the latest channel
      const latestChannel = action.payload.reduce(
        (a, c) => (c.updatedAt > a.updatedAt ? c : a),
        action.payload[0]
      );
      if (latestChannel) {
        try {
          // get messages in the channel
          const payload = await getChannelMessages(latestChannel.id);
          // dispatch GetChannelMessagesAction to update store
          storeApi.dispatch(GetChannelMessagesAction(payload));
        } catch (e) {
          console.error(e);
        }
      }
    }
    if (action.type === "channel/getChannelMessages") {
      // also highlight channel
      // storeApi.dispatch(
      //   HighlightChannelAction({ channelId: action.payload.channel.id })
      // );
    }
    if (
      action.type === "channel/highlightChannel" ||
      action.type === "channel/receiveMessage"
    ) {
      // scroll down to the bottom
      const chatPane = document.querySelector(".chat-pane");
      if (chatPane) {
        chatPane.scrollTop = chatPane.scrollHeight;
      }
    }

    /**
     * if user is added from new channel dialog with a certain condition,
     * update button status
     */
    if (action.type === "newChannel/addSuggestedUser") {
      const { buttonDisabled, channelName } = storeApi.getState().newChannel;
      if (buttonDisabled && channelName.length > 4) {
        // enable button
        return storeApi.dispatch(updateCreateButtonAction({ disable: false }));
      }
    }

    // if user is removed from new channel dialog with a certain condition,
    // disable create button
    if (action.type === "newChannel/removeSuggestedUser") {
      const { buttonDisabled, channelName, selectedUsers } =
        storeApi.getState().newChannel;
      if (
        !buttonDisabled &&
        (channelName.length <= 4 || selectedUsers.length === 0)
      ) {
        return storeApi.dispatch(updateCreateButtonAction({ disable: true }));
      }
    }

    // if type is newChannel/createChannel
    if (action.type === "newChannel/createChannel") {
      // then add the channel to channel state
      storeApi.dispatch(
        GetMyChannelsAction([
          action.payload.newChannel,
          ...storeApi.getState().channel.channels,
        ])
      );
      // clear channel name in the new channel dialog form
      storeApi.dispatch(UpdateChannelNameAction(""));
      // clear user list
      storeApi.dispatch(RemoveAllSuggestedUsersAction());
      // clear status message
      storeApi.dispatch(UpdateCreateChannelStatusAction(""));
    }
  };
