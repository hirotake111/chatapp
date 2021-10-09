import { Reducer } from "redux";
import { UserActionTypes } from "../actions/userActions";

export interface UserState {
  isAuthenticated: boolean;
  userInfo?: UserInfoType;
  showProfileModal: boolean;
}

export interface UserInfoType {
  userId: string;
  username: string;
  displayName: string;
  profilePhotoURL: string;
  firstName?: string;
  lastName?: string;
}

export const initialState: UserState = {
  isAuthenticated: false,
  userInfo: undefined,
  showProfileModal: false,
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
        ...state,
        isAuthenticated: true,
        userInfo: { ...action.payload },
      };

    // sign out action
    case "user/signedOut":
      return { ...state, isAuthenticated: false, userInfo: undefined };

    // toggle user profile modal action
    case "user/toggleUserProfile":
      return { ...state, showProfileModal: action.payload.enable };

    // default action
    default:
      return state;
  }
};

export default userReducer;
