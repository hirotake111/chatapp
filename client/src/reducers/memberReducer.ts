import { Reducer } from "redux";

import { MemberActionTypes } from "../actions/memberActions";

interface MemberState {
  modalEnabled: boolean;
}

export const initialMemberState: MemberState = {
  modalEnabled: false,
};

export const memberReducer: Reducer<MemberState, MemberActionTypes> = (
  state = initialMemberState,
  action: MemberActionTypes
): MemberState => {
  switch (action.type) {
    case "member/updateMemberModal":
      return { ...state, modalEnabled: action.payload.enabled };
    default:
      return state;
  }
};
