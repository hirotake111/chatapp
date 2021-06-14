import { ConfigType } from "../config";
import { ChannelQuery, getChannelQuery } from "./channelQuery";
import { getUserService, UserQuery } from "./userQuery";

export interface Services {
  userService: UserQuery;
  channelQuery: ChannelQuery;
}
export const getService = (config: ConfigType): Services => ({
  userService: getUserService(config.database.models.User),
  channelQuery: getChannelQuery(config.database.models.Channel),
});
