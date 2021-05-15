import { ConfigType } from "../config";
import { getUserService, UserService } from "./user.service";

export interface ServicesType {
  userService: UserService;
}
export const getService = (config: ConfigType): ServicesType => ({
  userService: getUserService(config.database.models.User),
});
