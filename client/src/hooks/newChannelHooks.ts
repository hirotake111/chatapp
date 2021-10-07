import { useAppDispatch, useAppSelector } from "./reduxHooks";
import {
  CreateChannelAction,
  UpdateChannelNameAction,
  updateCreateButtonAction,
  UpdateCreateChannelStatusAction,
  updateNewChannelModalAction,
} from "../actions/newChannelActions";
import {
  asyncTimeInterval,
  fetchChannelDetailPayload,
  postData,
} from "../utils/network";
import { socket } from "../utils/ws/socket";

/**
 * update channel name, then enable/disable create button based on channe name and users
 */
export const useUpdateCreateButtonStatus = () => {
  const dispatch = useAppDispatch();
  const {
    channelName,
    selectedUsers: users,
    buttonDisabled,
  } = useAppSelector((state) => state.newChannel);

  const update = (updatedChannelName: string): void => {
    // update channel name
    dispatch(UpdateChannelNameAction(updatedChannelName));
    if (updatedChannelName.length > 4 && users.length > 0 && buttonDisabled) {
      // enable create button
      dispatch(updateCreateButtonAction({ disable: false }));
      return;
    }
    if (
      !buttonDisabled &&
      (updatedChannelName.length <= 4 || users.length === 0)
    ) {
      // disable create button
      dispatch(updateCreateButtonAction({ disable: true }));
      return;
    }
  };

  return [channelName, update] as const;
};

/**
 * this hook creates a new channel
 */
export const useCreateChannel = () => {
  const dispatch = useAppDispatch();
  const { channelName, selectedUsers } = useAppSelector(
    (state) => state.newChannel
  );

  const create = async (): Promise<void> => {
    // disable create button first
    dispatch(updateCreateButtonAction({ disable: true }));
    try {
      // conver an array of users into an array of IDs
      const memberIds = selectedUsers.map((user) => user.id);
      // post data to channel endpoint
      const body = await postData("/api/channel", { channelName, memberIds });
      const { channelId } = body;
      // if the network call failed - stop processing
      if (!channelId)
        throw new Error("couldn't get new channel ID from server");
      // display message
      dispatch(UpdateCreateChannelStatusAction("Creating new channel..."));
      try {
        // get channel detail. This will throw an error if response code !== 200
        const func = asyncTimeInterval(fetchChannelDetailPayload);
        const channel = await func(3, 2000, channelId);
        // hide modal
        dispatch(updateNewChannelModalAction(false));
        // update channel state
        dispatch(CreateChannelAction(channel));
        // join the channel (room)
        socket.emit("join new room", { channelId: channel.id });
        return;
      } catch (e) {
        // display error message on the client
        dispatch(
          UpdateCreateChannelStatusAction("Error: failed to create channel")
        );
        throw e;
      }
    } catch (e) {
      console.error(e);
    }
  };

  return create;
};
