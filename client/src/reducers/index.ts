import { combineReducers } from "redux";

import { userReducer } from "./userReducer";
import { channelReducer } from "./channelReducer";
import { messageReducer } from "./mesageReducer";
import { newChannelReducer } from "./newChannelReducers";
import { memberReducer } from "./memberReducer";

export default combineReducers({
  user: userReducer,
  channel: channelReducer,
  newChannel: newChannelReducer,
  message: messageReducer,
  member: memberReducer,
});
