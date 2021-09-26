import { Reducer } from "redux";
import { ChannelActionTypes } from "../actions/channelActions";

interface ChannelState {
  channels: ChannelPayload[];
  highlighted?: string;
  memberModalEnabled: boolean;
  candidates: SearchedUser[];
  suggestions: SearchedUser[];
  searchStatus: UserSearchStatus;
  addMemberButtonEnabled: boolean;
  loading: boolean;
}

export const initialChannelState: ChannelState = {
  channels: [],
  highlighted: undefined,
  memberModalEnabled: false,
  candidates: [],
  suggestions: [],
  searchStatus: { type: "notInitiated" },
  addMemberButtonEnabled: true,
  loading: true,
};

export const channelReducer: Reducer<ChannelState, ChannelActionTypes> = (
  state = initialChannelState,
  action: ChannelActionTypes
): ChannelState => {
  switch (action.type) {
    case "channel/fetchOneChannel": {
      // const { channel } = action.payload;
      const others = state.channels.filter(
        ({ id }) => id !== action.payload.id
      );
      return { ...state, channels: [...others, action.payload] };
    }

    case "channel/fetchChannels":
      return {
        ...state,
        channels: [...action.payload.channels],
      };

    case "channel/getChannelMessages": {
      const others = state.channels.filter(
        ({ id }) => id !== action.payload.id
      );
      return {
        ...state,
        channels: [...others, { ...action.payload }],
      };
    }

    case "channel/highlightChannel": {
      return {
        ...state,
        highlighted: action.payload.channelId,
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
      const updated: ChannelPayload = channel
        ? { ...channel, messages: [...channel.messages, message] }
        : {
            id: message.channelId,
            name: "",
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
            users: [],
            messages: [message],
          };
      return { ...state, channels: [...others, updated] };
    }

    case "channel/addCandidateToExistingChannel":
      return {
        ...state,
        candidates: [...state.candidates, action.payload.candidate],
      };

    case "channel/removeCandidateFromExistingChannel":
      return {
        ...state,
        candidates: state.candidates.filter(
          (candidate) => candidate.id !== action.payload.candidate.id
        ),
      };

    case "channel/clearCandidateFromExistingChannel":
      return { ...state, candidates: [] };

    case "channel/updateMemberModal":
      return { ...state, memberModalEnabled: action.payload.enabled };

    case "channel/UpdateSearchStatus":
      return { ...state, searchStatus: action.payload.status };

    case "channel/UpdateMemberButtonEnabled":
      return { ...state, addMemberButtonEnabled: action.payload.enabled };

    case "channel/ToggleChannelLoading":
      return { ...state, loading: !state.loading };

    default:
      return state;
  }
};
