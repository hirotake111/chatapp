import { ConfigType } from "../config";
import { getUserService, UserService } from "./user.service";

export interface Services {
  userService: UserService;
}
export const getService = (config: ConfigType): Services => ({
  userService: getUserService(config.database.models.User),
});
