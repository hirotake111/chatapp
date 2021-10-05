import { useAppDispatch, useAppSelector } from "./reduxHooks";
import { updateCreateButtonAction } from "../actions/newChannelActions";

/**todo */
export const useUpdateCreateButtonStatus = () => {
  const dispatch = useAppDispatch();
  const {
    channelName,
    selectedUsers: users,
    buttonDisabled,
  } = useAppSelector((state) => state.newChannel);

  const update = (): void => {
    if (channelName.length > 4 && users.length > 0 && buttonDisabled) {
      // enable create button
      dispatch(updateCreateButtonAction({ disable: false }));
      return;
    }
    if (!buttonDisabled && (channelName.length <= 4 || users.length === 0)) {
      // disable create button
      dispatch(updateCreateButtonAction({ disable: true }));
      return;
    }
  };

  return update;
};
