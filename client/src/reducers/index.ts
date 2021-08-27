import { combineReducers } from "redux";

import { userReducer } from "./userReducer";
import { channelReducer } from "./channelReducer";
import { messageReducer } from "./mesageReducer";
import { newChannelReducer } from "./newChannelReducers";

export default combineReducers({
  user: userReducer,
  channel: channelReducer,
  newChannel: newChannelReducer,
  message: messageReducer,
});
