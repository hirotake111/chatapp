import { validate } from "uuid";
import { AppThunk } from "./store";

import { registerWSEventHandlers, socket } from "./socket";
import {
  getChannelMessages,
  fetchChannelDetailPayload,
  getUserSearchSuggestions,
} from "./utils";
import { validateChannelsPayload, validateMessage } from "./validators";
import { getData, getUserData, postData } from "./network";
import { userSignInAction } from "../actions/userActions";
import {
  GetChannelDetailAction,
  GetMyChannelsAction,
  GetChannelMessagesAction,
  HighlightChannelAction,
  ReceiveMessageAction,
  UpdateMemberModalAction,
  UpdateMemberCandidateSearchStatusAction,
  AddCandidateToExistingChannelAction,
  RemoveCandidateFromExistingChannelAction,
  UpdateMemberButtonEnabledAction,
  ToggleChannelLoadingAction,
} from "../actions/channelActions";

import {
  ShowNewChannelModalAction,
  hideNewChannelModalAction,
  AddSuggestedUserAction,
  RemoveSuggestedUserAction,
  UpdateSearchStatusAction,
  CreateChannelAction,
  EnableCreateButtonAction,
  DisableCreateButtonAction,
  UpdateChannelNameAction,
  UpdateCreateChannelStatusAction,
} from "../actions/newChannelActions";
import { ChangeMessageBeenEditedAction } from "../actions/messageActions";
import { RefObject } from "react";
import { validateData } from "./validators";
import { UserInfoType } from "../reducers/userReducer";
import { onChatMessage, onJoinedNewRoom } from "./ws/eventHandlers";
// import { storage } from "./storage";

export const thunkSignIn = (): AppThunk => async (dispatch) => {
  try {
    // get user info from server
    const userInfo = await getUserData();
    /**
     * now we are sure the user is authenticated
     * -> register event handlers for WS
     */
    registerWSEventHandlers({
      "chat message": (data: any) => onChatMessage(dispatch, data),
      "joined a new room": async (data: any) => onJoinedNewRoom(dispatch, data),
    });
    // dispatch sign in action
    dispatch(userSignInAction(userInfo));
  } catch (e) {
    throw e;
  }
};

export const thunkGetChannelDetail =
  (channelId: string): AppThunk =>
  async (dispatch) => {
    try {
      const payload = await fetchChannelDetailPayload(channelId);
      // dispatch action
      dispatch(GetChannelDetailAction(payload));
    } catch (e) {
      console.error(e);
    }
  };

/**
 * Fetch a list of channels from server, then update store
 */
export const thunkGetMyChannels = (): AppThunk => async (dispatch) => {
  try {
    // get channel detail from API server
    const body = await getData("/api/channel/");
    // validate payload
    const payload = validateChannelsPayload(body);
    // dispatch action
    dispatch(GetMyChannelsAction(payload));
    // update loading state
    dispatch(ToggleChannelLoadingAction());
  } catch (e) {
    throw e;
  }
};

export const thunkHighlightChannel =
  (channel: ChannelPayload): AppThunk =>
  async (dispatch) => {
    dispatch(HighlightChannelAction({ channelId: channel.id }));
  };

export const thunkChangeFormContent =
  (content: string): AppThunk =>
  async (dispatch) => {
    // this just dispatch payload to reducer
    dispatch(ChangeMessageBeenEditedAction({ content }));
  };

export const thunkOnChatMessage =
  (message: Message): AppThunk =>
  async (dispatch) => {
    dispatch(ReceiveMessageAction(message));
    //
  };

export const thunkShowNewChannelModal = (): AppThunk => async (dispatch) => {
  dispatch(ShowNewChannelModalAction());
};

export const thunkHideNewChannelModal = (): AppThunk => async (dispatch) => {
  dispatch(hideNewChannelModalAction());
};

export const thunkAddSuggestedUser =
  (user: SearchedUser): AppThunk =>
  async (dispatch) => {
    dispatch(AddSuggestedUserAction(user));
    dispatch(UpdateSearchStatusAction({ type: "searchDone" }));
  };

export const thunkRemoveSuggestedUser =
  (userId: string): AppThunk =>
  async (dispatch) => {
    dispatch(RemoveSuggestedUserAction(userId));
  };

export const thunkHideSearchSuggestions = (): AppThunk => async (dispatch) => {
  dispatch(UpdateSearchStatusAction({ type: "notInitiated" }));
};

export const thunkUpdateSearchStatus =
  (
    searchbox: RefObject<HTMLInputElement>,
    suggestedUsers: SearchedUser[]
  ): AppThunk =>
  async (dispatch) => {
    try {
      // if form is empty, set "notInitiated"
      if (!(searchbox.current && searchbox.current.value.length !== 0))
        return dispatch(UpdateSearchStatusAction({ type: "notInitiated" }));
      const query = searchbox.current.value;
      // change state to "searching"
      dispatch(UpdateSearchStatusAction({ type: "searching" }));
      const timeout: NodeJS.Timeout = setTimeout(async () => {
        // if string differs from the previous value, then user is still typing... end function
        if (searchbox.current?.value !== query) {
          return clearTimeout(timeout);
        }
        try {
          // get users from server
          let users = await getUserSearchSuggestions(query);
          const suggestedIds = suggestedUsers.map((u) => u.id);
          users = users.filter((u) => !suggestedIds.includes(u.id));
          if (users.length === 0) {
            // no users suggested -> show "no user found"
            return dispatch(UpdateSearchStatusAction({ type: "noUserFound" }));
          }
          // at least one user found -> update state
          return dispatch(
            UpdateSearchStatusAction({ type: "userFound", users })
          );
        } catch (e) {
          console.error(e);
          return;
        }
      }, 1000);
    } catch (e) {
      console.error(e);
    }
  };

export const thunkUpdateCreateButtonStatus =
  (channelName: string, members: SearchedUser[], disabled: boolean): AppThunk =>
  async (dispatch) => {
    if (channelName.length > 4 && members.length > 0 && disabled)
      return dispatch(EnableCreateButtonAction());
    if (!disabled && (channelName.length <= 4 || members.length === 0))
      return dispatch(DisableCreateButtonAction());
  };

/**
 * create a new channel, then get the information, upate channel state
 */
export const thunkCreateChannel =
  (channelName: string, members: SearchedUser[]): AppThunk =>
  async (dispatch) => {
    // convert an array of users into an array of user ID
    const memberIds = members.map((member) => member.id);
    try {
      // disable create button
      dispatch(DisableCreateButtonAction());
      // post data to channel endpoint
      const body = await postData("/api/channel", { channelName, memberIds });
      // validate body
      const { channelId } = body;
      // if the network call failed - stop processing
      if (!channelId)
        return console.error("couldn't get new channel ID from server");
      // display message
      dispatch(UpdateCreateChannelStatusAction("Creating new channel..."));
      // wait for the channel to be created
      let count = 0;
      const timeout = setInterval(async () => {
        count++;
        if (count > 3) {
          // stop the network call
          clearTimeout(timeout);
          return dispatch(
            UpdateCreateChannelStatusAction("Error: failed to create channel")
          );
        }
        try {
          // get channel detail. This will throw an error if response code !== 200
          const channel = await fetchChannelDetailPayload(channelId);
          // if succeeded, proceed
          // stop network call
          clearTimeout(timeout);
          // hide modal
          dispatch(hideNewChannelModalAction());
          // update channel state
          dispatch(CreateChannelAction(channel));
          // join the channel (room)
          socket.emit("join new room", { channelId: channel.id });
        } catch (e) {
          console.error(e);
        }
      }, 2000);
    } catch (e) {
      console.error(e);
    }
  };

export const thunkUpdateChannelName =
  (channelName: string): AppThunk =>
  async (dispatch) => {
    dispatch(UpdateChannelNameAction(channelName));
  };

export const thunkUpdateMemberModal =
  (enabled: boolean): AppThunk =>
  async (dispatch) => {
    dispatch(UpdateMemberModalAction(enabled));
  };

export const thunkUpdateMemberCandidateSearchStatus =
  (status: UserSearchStatus): AppThunk =>
  async (dispatch) => {
    dispatch(UpdateMemberCandidateSearchStatusAction(status));
  };

export const thunkAddCandidateToExistingChannel =
  (candidate: SearchedUser): AppThunk =>
  async (dispatch) => {
    dispatch(UpdateMemberCandidateSearchStatusAction({ type: "searchDone" }));
    dispatch(AddCandidateToExistingChannelAction(candidate));
  };

export const thunkRemoveCandidateFromExistingChannel =
  (candidate: SearchedUser): AppThunk =>
  async (dispatch) => {
    dispatch(RemoveCandidateFromExistingChannelAction(candidate));
  };

export const thunkGetUserByQuery =
  (
    query: string,
    candidates: SearchedUser[],
    channel: ChannelPayload
  ): AppThunk =>
  async (dispatch) => {
    // change search status
    dispatch(UpdateMemberCandidateSearchStatusAction({ type: "searching" }));
    try {
      let users = await getUserSearchSuggestions(query);
      // console.log("users:", users);
      const channelUserIds = channel.users.map((user) => user.id);
      // console.log("ids:", channelUserIds);
      const candidateIds = candidates.map((c) => c.id);
      // console.log("candidateIds:", candidateIds);
      // console.log(
      //   "users:",
      //   users.filter((user) => channelUserIds.includes(user.id))
      // );
      users = users
        .filter((user) => !channelUserIds.includes(user.id))
        .filter((user) => !candidateIds.includes(user.id));
      // console.log("users:", users);
      // if suggested user is 0, then update status into "noUserFound"
      if (users.length === 0)
        return dispatch(
          UpdateMemberCandidateSearchStatusAction({ type: "noUserFound" })
        );
      dispatch(
        UpdateMemberCandidateSearchStatusAction({
          type: "userFound",
          users,
        })
      );
    } catch (e) {
      throw e;
    }
  };

export const thunkAddMemberToChannel =
  (memberIds: string[], channelId: string | undefined): AppThunk =>
  async (dispatch) => {
    // if no candidate, return
    if (memberIds.length === 0) return;
    // if no channel ID, return
    if (!channelId) throw new Error("channel is undefined");
    // const { id: channelId } = channel;
    if (!channelId) throw new Error("invalid channel ID");
    try {
      // disable button
      dispatch(UpdateMemberButtonEnabledAction(false));
      // post data to channel endpoint
      const body = await postData(`/api/channel/${channelId}/member`, {
        userIds: memberIds,
      });
      // validate detail
      const { detail, added }: { detail: string; added: string[] } = body;
      if (!(detail && detail === "success"))
        throw new Error(`failed to fetch data from server: ${body}`);
      if (!(Array.isArray(added) && added.length > 0))
        throw new Error(`invalid added payload from server: ${added}`);
      added.forEach((id) => {
        if (!validate(id)) throw new Error(`invalid user id: ${id}`);
      });
      try {
        // fetch channel info and update UI
        let count = 0;
        const timeout = setInterval(async () => {
          if (count++ > 3) {
            console.error("failed to get channel data - timeout");
            // stop the network call
            clearTimeout(timeout);
            return;
          }
          // get/validate channel detail.
          // This will throw an error if response code !== 200
          const payload = await fetchChannelDetailPayload(channelId);
          // if succeeded, clear timeout function
          clearTimeout(timeout);
          dispatch(GetChannelDetailAction(payload));
          // Enable button, clear candidate, disable modal, update channel
          dispatch(UpdateMemberModalAction(false));
        }, 2000);
      } catch (e) {
        throw e;
      }
    } catch (e) {
      if (e instanceof Error) return console.error(e.message);
      throw e;
    }
  };
