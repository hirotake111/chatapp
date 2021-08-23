import { Reducer } from "redux";
import { ChannelActionTypes } from "../actions/channelActions";

interface ChannelState {
  channels: ChannelPayload[];
  highlighted?: { id: string; name: string };
}

export const initialChannelState: ChannelState = {
  channels: [],
  highlighted: undefined,
};

export const channelReducer: Reducer<ChannelState, ChannelActionTypes> = (
  state = initialChannelState,
  action: ChannelActionTypes
): ChannelState => {
  switch (action.type) {
    case "channel/fetchOneChannel": {
      const { channel } = action.payload;
      const others = state.channels.filter(({ id }) => id !== channel.id);
      return { ...state, channels: [...others, channel] };
    }

    case "channel/fetchChannels":
      return {
        ...state,
        channels: [...action.payload.channels],
      };

    case "channel/getChannelMessages": {
      const { channel } = action.payload;
      const others = state.channels.filter(({ id }) => id !== channel.id);
      return {
        ...state,
        channels: [...others, { ...channel }],
      };
    }

    case "channel/highlightChannel": {
      return {
        ...state,
        highlighted: { id: action.payload.id, name: action.payload.name },
      };
    }

    case "channel/receiveMessage": {
      const message = action.payload;
      // get channel by channelId
      const channel = state.channels.filter(
        (ch) => ch.id === message.channelId
      )[0];
      // get other channels
      const others = state.channels.filter((ch) => ch.id !== message.channelId);
      // generate updated channel object
      const updated = { ...channel, messages: [...channel.messages, message] };
      return { ...state, channels: [...others, updated] };
    }

    default:
      return state;
  }
};
