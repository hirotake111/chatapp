import { User } from "./User.model";
import { Message } from "./Message.model";
import { Roster } from "./Roster.model";
import { Thread } from "./Thread.model";

export interface Models {
  User: typeof User;
  Message: typeof Message;
  Roster: typeof Roster;
  Thread: typeof Thread;
}
