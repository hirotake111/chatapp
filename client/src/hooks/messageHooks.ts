import { v4 as uuid } from "uuid";

import { useAppDispatch, useAppSelector } from "./reduxHooks";
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
  const {
    user: { isAuthenticated, userInfo },
    channel: { highlighted },
  } = useAppSelector((state) => state);
  const dispatch = useAppDispatch();

  const send = (content: string): void => {
    // exit if message content is empty
    if (content.length === 0) {
      console.warn("message is empty - aborted");
      return;
    }

    // check to see if user is authenticated
    if (!(isAuthenticated && userInfo))
      return console.warn("you are probably not signed in");

    // if highlighted channel ID is falsy value, do nothing
    if (!highlighted) return console.warn(`prop highlighted is ${highlighted}`);

    // generate new message
    const message: Message = {
      id: uuid(),
      channelId: highlighted,
      content,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sender: {
        id: userInfo.userId,
        username: userInfo.username,
        displayName: userInfo.displayName,
      },
    };
    // send message to server
    socket.emit("chat message", message);
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
