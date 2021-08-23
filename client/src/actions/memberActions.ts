import { Action, PayloadAction } from "@reduxjs/toolkit";

/**
 * Types
 */
type UpdateMemberModalType = "member/updateMemberModal";

/**
 * Payload Types
 */
export interface UpdateMemberModalPayload {
  enabled: boolean;
}

/**
 * Action Types
 */
interface UpdateMemberModalActionType
  extends PayloadAction<UpdateMemberModalPayload, UpdateMemberModalType> {
  type: UpdateMemberModalType;
  payload: UpdateMemberModalPayload;
}

export type MemberActionTypes = UpdateMemberModalActionType;

/**
 * Actions
 */
export const UpdateMemberModalAction = (
  enabled: boolean
): UpdateMemberModalActionType => ({
  type: "member/updateMemberModal",
  payload: { enabled },
});
