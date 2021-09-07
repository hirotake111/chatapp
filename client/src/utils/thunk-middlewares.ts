import { v4 as uuid } from "uuid";
import { AppThunk } from "./store";

import { socket } from "./socket";
import {
  validateGetChannelDetailPayload,
  validateGetMyChannelsPayload,
  getChannelMessages,
  validateSearchSuggestionUser,
  fetchChannelDetailPayload,
  getData,
} from "./utils";
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
import { validateUserInfo } from "./validators";

export const thunkSignIn = (): AppThunk => async (dispatch) => {
  try {
    const body = await getData("/api/user/me");
    const userInfo = validateUserInfo(body);
    dispatch(userSignInAction(userInfo));
  } catch (e) {
    throw e;
  }
};

export const thunkGetChannelDetail =
  (channelId: string): AppThunk =>
  async (dispatch) => {
    try {
      // get channel detail from API server
      const res = await fetch(`/api/channel/${channelId}`);
      const body = await res.json();
      // if status code is 4xx or 5xx alert it
      if (res.status >= 400) {
        console.error(`error code: ${res.status}`);
        console.error("body: ", body);
        return;
      }
      // validate payload
      const payload = validateGetChannelDetailPayload(body);
      // dispatch actio
      dispatch(GetChannelDetailAction(payload));
    } catch (e) {
      console.error();
    }
  };

export const thunkGetMyChannels = (): AppThunk => async (dispatch) => {
  try {
    // get channel detail from API server
    const res = await fetch("/api/channel/");
    const body = await res.json();
    // if status code is 4xx or 5xx alert it
    if (res.status >= 400)
      throw new Error(`error code: ${res.status}, body: ${body}`);
    // validate payload
    const payload = validateGetMyChannelsPayload(body);
    // dispatch actio
    dispatch(GetMyChannelsAction(payload));
  } catch (e) {
    throw e;
  }
};

/**
 * Get messages in a specific channel, and then update state
 * @param channelId ${string}
 * @returns ${void}
 */
export const thunkGetChannelMessages =
  (channelId: string): AppThunk =>
  async (dispatch) => {
    try {
      // get channel messages from server
      const payload = await getChannelMessages(channelId);
      // dispatch action
      dispatch(GetChannelMessagesAction(payload));
    } catch (e) {
      console.error(e);
    }
  };

export const thunkHighlightChannel =
  (channel: ChannelPayload): AppThunk =>
  async (dispatch) => {
    dispatch(HighlightChannelAction(channel));
  };

export const thunkChangeFormContent =
  (content: string): AppThunk =>
  async (dispatch) => {
    // this just dispatch payload to reducer
    dispatch(ChangeMessageBeenEditedAction({ content }));
  };

export const thunkSendMessage =
  ({ channelId, sender, content }: MessageWithNoId): AppThunk =>
  async (dispatch) => {
    // check socket connectivity
    if (!socket.connected) {
      console.error("WebSocket not connected - retrying");
      socket.connect();
      // return;
    }
    // exit if message content is empty
    if (content.length === 0) {
      console.warn("message is empty - aborted");
      return;
    }
    // generate new message ID
    const chatMessage: Message = {
      id: uuid(),
      sender: { id: sender.id, name: sender.username },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      channelId,
      content,
    };
    // send message to server
    socket.emit("chat message", chatMessage);
    // empty form
    dispatch(ChangeMessageBeenEditedAction({ content: "" }));
  };

export const thunkOnChatMessage =
  (message: Message): AppThunk =>
  async (dispatch) => {
    dispatch(ReceiveMessageAction(message));
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

      // change tate to "searching"
      dispatch(UpdateSearchStatusAction({ type: "searching" }));
      const timeout: NodeJS.Timeout = setTimeout(async () => {
        // if string differs from the previous value, then user is still typing... end function
        if (searchbox.current?.value !== query) return clearTimeout(timeout);
        // get data
        const { detail, users }: { detail: string; users: SearchedUser[] } =
          await fetch(`/api/user?q=${query}`).then((data) => data.json());
        // validate body
        if (!(detail && detail === "success" && users && Array.isArray(users)))
          return console.error("invalid response from server");
        // if body.users is empty, then show message
        const suggestedIds = suggestedUsers.map((u) => u.id);
        const searchedUser = users.filter((u) => !suggestedIds.includes(u.id));
        if (searchedUser.length === 0)
          return dispatch(UpdateSearchStatusAction({ type: "noUserFound" }));
        // at least one user found -> validate the first user
        if (!validateSearchSuggestionUser(users[0]))
          dispatch(
            UpdateSearchStatusAction({
              type: "error",
              detail: "validation error - invalid response from server",
            })
          );
        // update state
        return dispatch(
          UpdateSearchStatusAction({ type: "userFound", users: searchedUser })
        );
      }, 1000);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      } else throw e;
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

// export const thunkUpdateCreateChannelStatus =
//   (message: string): AppThunk =>
//   async (dispatch) => {
//     dispatch(UpdateCreateChannelStatusAction(message));
//   };

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
      const body = await fetch("/api/channel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName, memberIds }),
      }).then((data) => data.json());
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
          const payload = await fetchChannelDetailPayload(channelId);
          // if succeeded, do the followning code
          // console.warn(payload);
          // stop network call
          clearTimeout(timeout);
          // hide modal
          dispatch(hideNewChannelModalAction());
          // update channel state
          dispatch(CreateChannelAction(payload.channel));
          // join the channel (room)
          socket.emit("join new room", { channelId: payload.channel.id });
        } catch (e) {
          if (e instanceof Error) {
            console.error(e.message);
          } else throw e;
        }
      }, 2000);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      } else throw e;
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
      const body = await fetch(`/api/user?q=${query}`)
        .then((data) => data.json())
        .catch((e) => {
          throw e;
        });
      const { detail, users }: { detail: string; users: SearchedUser[] } = body;
      // validate body
      if (!(detail && detail === "success" && users && Array.isArray(users)))
        return console.error("invalid response from server");
      // filter users
      const channelUserIds = channel.users.map((user) => user.id);
      const candidateIds = candidates.map((c) => c.id);
      const suggestedUsers = users
        .filter((user) => !channelUserIds.includes(user.id))
        .filter((user) => !candidateIds.includes(user.id));
      // if suggested user is 0, then update status into "noUserFound"
      if (suggestedUsers.length === 0)
        return dispatch(
          UpdateMemberCandidateSearchStatusAction({ type: "noUserFound" })
        );
      dispatch(
        UpdateMemberCandidateSearchStatusAction({
          type: "userFound",
          users: suggestedUsers,
        })
      );
    } catch (e) {
      throw e;
    }
  };

export const thunkAddMemberToChannel =
  (
    memberIds: string[],
    channel: { id: string; name: string } | undefined
  ): AppThunk =>
  async (dispatch) => {
    // if no candidate, return
    if (memberIds.length === 0) return;
    // if no channel ID, return
    const channelId = channel?.id;
    if (!channelId) {
      console.error("invalid channel ID");
      return;
    }
    try {
      // disable button
      dispatch(UpdateMemberButtonEnabledAction(false));
      // post data to channel endpoint
      const body = await fetch(`/api/channel/${channelId}/member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: memberIds }),
      }).then((data) => data.json());
      // validate body
      const { detail, added }: { detail: string; added: string[] } = body;
      if (!(detail && detail === "success"))
        return console.error("failed to fetch data from server:", body);
      if (
        !(
          added &&
          Array.isArray(added) &&
          added.length > 0 &&
          typeof added[0] === "string"
        )
      )
        return console.error("invalid added payload from server:", added);
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
        if (e instanceof Error) {
          console.error(e.message);
        } else throw e;
      }
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      } else throw e;
    }
  };
