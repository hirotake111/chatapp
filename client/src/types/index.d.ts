declare interface ChannelPayload {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  users: { id: string; displayName: string }[];
  messages: Message[];
}

declare interface Message {
  id: string;
  channelId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  sender: {
    id: string;
    username: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
    profilePhotoURL?: string;
  };
}

declare interface MessageWithNoId {
  channelId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  sender: {
    id: string;
    username: string;
    displayName: string;
    firstName?: string;
    lastName?: string;
  };
}

// suggested user type
declare interface SearchedUser {
  id: string;
  username: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
}

// user search box state
type UserSearchStatus =
  | { type: "notInitiated" }
  | { type: "searching" }
  | { type: "userFound"; users: SearchedUser[] }
  | { type: "noUserFound" }
  | { type: "hidden" }
  | { type: "searchDone" }
  | { type: "error"; detail: string };
