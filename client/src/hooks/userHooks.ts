import { userSignInAction } from "../actions/userActions";
import { getUserData } from "../utils/network";
import { registerWSEventHandlers } from "../utils/socket";
import { onChatMessage, onJoinedNewRoom } from "../utils/ws/eventHandlers";
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
      registerWSEventHandlers({
        "chat message": (data: any) => {
          onChatMessage(dispatch, data);
        },
        "joined a new room": async (data: any) => {
          onJoinedNewRoom(dispatch, data);
        },
      });
      // dispatch sign in action
      dispatch(userSignInAction(userInfo));
    } catch (e) {
      console.error(e);
    }
  };

  return [user, signin] as const;
};
