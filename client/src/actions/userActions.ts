import { Action } from "redux";
import { PayloadAction } from "@reduxjs/toolkit";
import { UserInfoType } from "../reducers/userReducer";

/**
 * type of action.type
 */
type userSignedInType = "user/signedIn";
type userSignedOutType = "user/signedOut";
type ToggleUserProfile = "user/toggleUserProfile";

/**
 * payload type
 */
type ToggleUserProfilePayload = { enable: boolean };

interface UserSignInActionType
  extends PayloadAction<UserInfoType, userSignedInType> {
  type: userSignedInType;
  payload: UserInfoType;
}

/**
 * action type
 */
interface UserSignOutActionType extends Action {
  type: userSignedOutType;
}

interface ToggleUserProfileActionType
  extends PayloadAction<ToggleUserProfilePayload, ToggleUserProfile> {
  type: ToggleUserProfile;
  payload: ToggleUserProfilePayload;
}

export type UserActionTypes =
  | UserSignInActionType
  | UserSignOutActionType
  | ToggleUserProfileActionType;

/**
 * Action creators
 */

export const userSignInAction = (
  userInfo: UserInfoType
): UserSignInActionType => {
  return {
    type: "user/signedIn",
    payload: userInfo,
  };
};

export const userSignOutAction = (): UserSignOutActionType => {
  return {
    type: "user/signedOut",
  };
};

export const toggleUserProfileAction = (
  payload: ToggleUserProfilePayload
): ToggleUserProfileActionType => ({
  type: "user/toggleUserProfile",
  payload,
});
