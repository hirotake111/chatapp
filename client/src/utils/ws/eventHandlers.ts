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
