import { ConfigType } from "../config";
import { ChannelQuery, getChannelQuery } from "./channelQuery";
import { getRosterQuery, RosterQuery } from "./rosterQeury";
import { getUserService, UserQuery } from "./userQuery";

export interface Services {
  userService: UserQuery;
  channelQuery: ChannelQuery;
  rosterQuery: RosterQuery;
}
export const getService = (config: ConfigType): Services => {
  const { User, Channel, Roster } = config.database.models;
  return {
    userService: getUserService(User),
    channelQuery: getChannelQuery(Channel),
    rosterQuery: getRosterQuery({ User, Channel, Roster }),
  };
};
