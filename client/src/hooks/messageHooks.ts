import { v4 as uuid } from "uuid";

import { useAppDispatch } from "./reduxHooks";
import { socket } from "../utils/ws/socket";
import { ChangeMessageBeenEditedAction } from "../actions/messageActions";
import {
  GetChannelMessagesAction,
  HighlightChannelAction,
} from "../actions/channelActions";
// import { storage } from "../utils/storage";
import { getChannelMessages } from "../utils/utils";

/**
 * custom hook that will send a message using WebSocket,
 * then dispatch an action to update store
 */
export const useSendMessage = () => {
  const dispatch = useAppDispatch();

  const send = (message: MessageWithNoId): void => {
    // exit if message content is empty
    if (message.content.length === 0) {
      console.warn("message is empty - aborted");
      return;
    }
    // generate new message ID
    const chatMessage: Message = { ...message, id: uuid() };
    // send message to server
    socket.emit("chat message", chatMessage);
    // empty content
    dispatch(ChangeMessageBeenEditedAction({ content: "" }));
  };

  return send;
};

/**
 * custom hook that will get messages by channel ID,
 * then dispatch an action to update messages in channel
 */
export const useGetMessagesByChannelId = () => {
  const dispatch = useAppDispatch();

  /**
   * get messages by channel ID
   */
  return async (channelId: string) => {
    // highlight channel in the first place
    dispatch(HighlightChannelAction({ channelId }));
    try {
      // get channel messages from server
      const payload = await getChannelMessages(channelId);
      // dispatch action
      dispatch(GetChannelMessagesAction(payload));
    } catch (e) {
      console.error(e);
    }
  };
};
