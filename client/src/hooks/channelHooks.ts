import {
  GetChannelDetailAction,
  GetMyChannelsAction,
  HighlightChannelAction,
  ToggleChannelLoadingAction,
} from "../actions/channelActions";
import { fetchChannelDetailPayload, fetchMyChannels } from "../utils/network";
import { useAppDispatch, useAppSelector } from "./reduxHooks";

/**
 * returns current hilighted channel and disspatch function that will updates channels
 */
export const useGetMyChannels = () => {
  const storedChannels = useAppSelector((state) => state.channel.channels);
  const dispatch = useAppDispatch();

  const getMyChannels = async () => {
    try {
      // get channel detail from API server
      const channels = await fetchMyChannels();
      // dispatch action
      dispatch(GetMyChannelsAction(channels));
      // update loading state
      dispatch(ToggleChannelLoadingAction());
      // if user has no channel joined, then exit
      if (channels.length === 0) return;
      // update highlighted channel
      const sortedChannels = channels.sort((a, b) => b.updatedAt - a.updatedAt);
      dispatch(HighlightChannelAction({ channelId: sortedChannels[0].id }));
    } catch (e) {
      console.error(e);
    }
  };

  return [storedChannels, getMyChannels] as const;
};

/**
 * returns function that fetches channel, then dispatch an action to update channels
 */
export const useFetchChannelDetail = (): ((
  chanelId: string
) => Promise<void>) => {
  const dispatch = useAppDispatch();

  return async (channelId: string): Promise<void> => {
    try {
      const channel = await fetchChannelDetailPayload(channelId);
      // dispatch action
      dispatch(GetChannelDetailAction(channel));
    } catch (e) {
      console.error(e);
    }
  };
};
