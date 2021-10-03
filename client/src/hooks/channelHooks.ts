import {
  GetMyChannelsAction,
  ToggleChannelLoadingAction,
} from "../actions/channelActions";
import { fetchMyChannels } from "../utils/network";
import { useAppDispatch, useAppSelector } from "./reduxHooks";

/**
 * returns current hilighted channel and disspatch function that will updates channels
 */
export const useGetMyChannels = () => {
  const channels = useAppSelector((state) => state.channel.channels);
  const dispatch = useAppDispatch();

  const getMyChannels = async () => {
    try {
      // get channel detail from API server
      const channels = await fetchMyChannels();
      // dispatch action
      dispatch(GetMyChannelsAction(channels));
      // update loading state
      dispatch(ToggleChannelLoadingAction());
    } catch (e) {
      console.error(e);
    }
  };

  return [channels, getMyChannels] as const;
};
