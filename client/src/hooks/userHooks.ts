import { userSignInAction } from "../actions/userActions";
import { getUserData } from "../utils/network";
import { socket } from "../utils/ws/socket";
import { registerWebSocketEventHandlers } from "../utils/ws/eventHandlers";
import { useAppDispatch, useAppSelector } from "./reduxHooks";

/**
 * returns signIn function that dispatches user signin action
 */
export const useSignIn = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const signin = async (): Promise<void> => {
    try {
      // get user info from server
      // (if not authenticated, automatically redirect to auth server)
      const userInfo = await getUserData();
      /**
       * now we are sure the user is authenticated
       * -> register event handlers for WS
       */
      registerWebSocketEventHandlers(socket, dispatch);
      // dispatch sign in action
      dispatch(userSignInAction(userInfo));
    } catch (e) {
      console.error(e);
    }
  };

  return [user, signin] as const;
};

/**
 * custom hook to toggle a modal next to display name
 */
export const useToggleUserModal = () => {
  const dispatch = useAppDispatch();

  const toggle = ({ enable }: { enable: boolean }): void => {
    /**
     * TODO
     */
  };

  return toggle;
};
