import { Reducer } from "redux";
import { UserActionTypes } from "../actions/userActions";

interface UserState {
  isAuthenticated: boolean;
  userInfo?: UserInfoType;
}

export interface UserInfoType {
  userId: string;
  username: string;
  displayName: string;
  profilePhotoURL?: string;
  firstName?: string;
  lastName?: string;
}

export const initialState: UserState = {
  isAuthenticated: false,
  // userInfo: {},
};

export const userReducer: Reducer<UserState, UserActionTypes> = (
  state = initialState,
  action: UserActionTypes
): UserState => {
  switch (action.type) {
    // sign in action
    case "user/signedIn":
      // console.log("payload: ", action.payload);
      return {
        isAuthenticated: true,
        userInfo: { ...action.payload },
      };

    // sign out action
    case "user/signedOut":
      return { isAuthenticated: false };

    // default action
    default:
      return state;
  }
};

export default userReducer;
