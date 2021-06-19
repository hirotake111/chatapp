import { ConfigType } from "../config";
import { ChannelQuery, getChannelQuery } from "./channelQuery";
import { getRosterQuery, RosterQuery } from "./rosterQeury";
import { getUserQuery, UserQuery } from "./userQuery";

export interface Queries {
  userQuery: UserQuery;
  channelQuery: ChannelQuery;
  rosterQuery: RosterQuery;
}
export const getService = (config: ConfigType): Queries => {
  const { User, Channel, Roster } = config.database.models;
  return {
    userQuery: getUserQuery({ UserModel: User }),
    channelQuery: getChannelQuery({ ChannelModel: Channel, UserModel: User }),
    rosterQuery: getRosterQuery({
      UserModel: User,
      ChannelModel: Channel,
      RosterModel: Roster,
    }),
  };
};
