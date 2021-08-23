import { Action } from "redux";
import { PayloadAction } from "@reduxjs/toolkit";
import { UserInfoType } from "../reducers/userReducer";

type userSignedInType = "user/signedIn";
type userSignedOutType = "user/signedOut";

interface UserSignInActionType
  extends PayloadAction<UserInfoType, userSignedInType> {
  type: userSignedInType;
  payload: UserInfoType;
}

interface UserSignOutActionType extends Action {
  type: userSignedOutType;
}

export type UserActionTypes = UserSignInActionType | UserSignOutActionType;

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
