import User from "./User.model";
import Message from "./Message.model";
import Roster from "./Roster.model";
import Channel from "./Channel.model";

export interface Models {
  User: typeof User;
  Message: typeof Message;
  Roster: typeof Roster;
  Channel: typeof Channel;
}
