import { v4 as uuid } from "uuid";
import { AppThunk } from "./store";

import { socket } from "./socket";
import { UserInfoType } from "./reducers/userReducer";
import {
  validateGetChannelDetailPayload,
  validateGetMyChannelsPayload,
  getChannelMessages,
  validateSearchSuggestionUser,
  fetchChannelDetailPayload,
} from "./utils/utils";
import { userSignInAction } from "./actions/userActions";
import {
  GetChannelDetailAction,
  GetMyChannelsAction,
  GetChannelMessagesAction,
  HighlightChannelAction,
  ReceiveMessageAction,
} from "./actions/channelActions";

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
} from "./actions/newChannelActions";
import { ChangeMessageBeenEditedAction } from "./actions/messageActions";
import { RefObject } from "react";
import { UpdateMemberModalAction } from "./actions/memberActions";

export const thunkSignIn = (): AppThunk => async (dispatch) => {
  try {
    const res = await fetch("/api/user/me");
    const body = await res.json();
    if (res.status === 401) return window.location.replace(body.location);

    dispatch(userSignInAction(body as UserInfoType));
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
      console.error(e.message);
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
          dispatch(
            UpdateCreateChannelStatusAction("Error: failed to create channel")
          );
          return;
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
          console.error(e.message);
        }
      }, 2000);
    } catch (e) {
      console.error(e.message);
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
