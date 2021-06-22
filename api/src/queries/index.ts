import { ConfigType } from "../config";
import { ChannelQuery, getChannelQuery } from "./channelQuery";
import { getRosterQuery, RosterQuery } from "./rosterQuery";
import { getUserQuery, UserQuery } from "./userQuery";

export interface Queries {
  userQuery: UserQuery;
  channelQuery: ChannelQuery;
  rosterQuery: RosterQuery;
}
export const getQueries = (config: ConfigType): Queries => {
  const { User, Channel, Roster } = config.database.models;
  return {
    userQuery: getUserQuery({ UserModel: User, ChannelModel: Channel }),
    channelQuery: getChannelQuery({ ChannelModel: Channel, UserModel: User }),
    rosterQuery: getRosterQuery({ RosterModel: Roster }),
  };
};
