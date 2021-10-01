import { v4 as uuid } from "uuid";

import { useAppDispatch } from "./reduxHooks";
import { socket } from "../utils/socket";
import { ChangeMessageBeenEditedAction } from "../actions/messageActions";

export const useSendMessage = () => {
  const dispatch = useAppDispatch();

  /**
   *
   */
  const send = (message: MessageWithNoId) => {
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
