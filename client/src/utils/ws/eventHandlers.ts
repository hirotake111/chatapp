import { Socket } from "socket.io-client";
import { AppDispatch } from "../store";
import { getChannelMessages } from "../utils";
import { validateMessage } from "../validators";
import {
  ReceiveMessageAction,
  GetChannelMessagesAction,
} from "../../actions/channelActions";
import { validate } from "uuid";

/**
 * validate data and dispatch action
 */
export const onChatMessage = (dispatch: AppDispatch, data: any): void => {
  // validate data and dispatch action
  const message = validateMessage(data);
  dispatch(ReceiveMessageAction(message));
};

/**
 * vlaidate channel ID, get messages, then dispatch action to update messages
 */
export const onJoinedNewRoom = async (
  dispatch: AppDispatch,
  channelId: any
) => {
  try {
    // validate channel ID (as it could be any data)
    if (!(channelId && validate(channelId)))
      throw new Error(
        `invalid channelId was given on "joined a new room" event - ${channelId}`
      );
    // get channel info and messages from server
    const payload = await getChannelMessages(channelId);
    // dispatch action
    dispatch(GetChannelMessagesAction(payload));
  } catch (e) {
    console.error(e);
  }
};

export const registerWebSocketEventHandlers = (
  socket: Socket,
  dispatch: AppDispatch
) => {
  // connect WebSocket server
  socket.connect();
  // on chat message event
  socket.on("chat message", (data: any) => {
    onChatMessage(dispatch, data);
  });
  // on joined a new room event
  socket.on("joined a new room", async (data: any) => {
    // console.log("fire!");
    onJoinedNewRoom(dispatch, data);
    // console.log("done");
  });
};
