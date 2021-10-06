import { useAppDispatch, useAppSelector } from "./reduxHooks";
import {
  UpdateChannelNameAction,
  updateCreateButtonAction,
} from "../actions/newChannelActions";

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
