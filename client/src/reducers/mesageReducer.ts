import { Reducer } from "redux";
import { MessageActionTypes } from "../actions/messageActions";

interface MessageState {
  content: string;
}

const initialMessageState: MessageState = {
  content: "",
};

export const messageReducer: Reducer<MessageState, MessageActionTypes> = (
  state = initialMessageState,
  action: MessageActionTypes
): MessageState => {
  switch (action.type) {
    case "message/changeFormContent":
      return {
        content: action.payload.content,
      };
    default:
      return state;
  }
};
