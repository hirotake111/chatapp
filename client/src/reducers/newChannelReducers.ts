import { Reducer } from "redux";
import { NewChannelActionTypes } from "../actions/newChannelActions";

interface NewChannelState {
  modal: boolean;
  channelName: string;
  selectedUsers: SearchedUser[];
  searchStatus: UserSearchStatus;
  buttonDisabled: boolean;
  createChannelStatusMessage: string;
}

const initState: NewChannelState = {
  modal: false,
  channelName: "",
  selectedUsers: [],
  searchStatus: { type: "notInitiated" },
  buttonDisabled: true,
  createChannelStatusMessage: "",
};

type NewChannelReducer = Reducer<NewChannelState, NewChannelActionTypes>;

export const newChannelReducer: NewChannelReducer = (
  state = initState,
  action: NewChannelActionTypes
): NewChannelState => {
  switch (action.type) {
    case "newChannel/updateNewChannelModal":
      return { ...state, modal: action.payload };

    case "newChannel/addSuggestedUser":
      return {
        ...state,
        selectedUsers: [...state.selectedUsers, action.payload],
      };

    case "newChannel/removeSuggestedUser":
      return action.payload.userId
        ? {
            ...state,
            selectedUsers: [
              ...state.selectedUsers.filter(
                (u) => u.id !== action.payload.userId
              ),
            ],
          }
        : { ...state, selectedUsers: [] };

    case "newChannel/updateSearchStatus":
      return { ...state, searchStatus: action.payload };

    case "newChannel/updateCreateButton":
      return { ...state, buttonDisabled: action.payload.disable };

    case "newChannel/updateChannelName":
      return { ...state, channelName: action.payload.channelName };

    case "newChannel/createChannel":
      return { ...state, modal: false };

    case "newChannel/updateCreateChannelStatus":
      return { ...state, createChannelStatusMessage: action.payload.message };

    default:
      return state;
  }
};
