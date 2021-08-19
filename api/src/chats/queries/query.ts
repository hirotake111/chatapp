import { ChatConfigType } from "../config";
import { ChannelQuery, getChannelQuery } from "./channelQuery";
import { getMessageQuery, MessageQuery } from "./messageQuery";
import { getRosterQuery, RosterQuery } from "./rosterQuery";
import { getUserQuery, UserQuery } from "./userQuery";

export interface Queries {
  userQuery: UserQuery;
  channelQuery: ChannelQuery;
  rosterQuery: RosterQuery;
  messageQuery: MessageQuery;
}

export const getQueries = (config: ChatConfigType): Queries => {
  const { User, Channel, Roster, Message } = config.database.models;
  return {
    userQuery: getUserQuery({ UserModel: User, ChannelModel: Channel }),
    channelQuery: getChannelQuery({
      ChannelModel: Channel,
      UserModel: User,
      MessageModel: Message,
    }),
    rosterQuery: getRosterQuery({ RosterModel: Roster }),
    messageQuery: getMessageQuery({ messageModel: Message }),
  };
};
