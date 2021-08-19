import { UserQuery } from "../queries/userQuery";

/**
 * helper function to check if the user is a member of a channel
 * if unexpected error happens, thow an error
 */
export const getCheckMember = (userQuery: UserQuery) => {
  return async (channelId: string, requesterId: string): Promise<boolean> => {
    try {
      const members = await userQuery.getUsersByChannelId(channelId);
      const ids = members.map((member) => member.id);
      return ids.includes(requesterId);
    } catch (e) {
      throw e;
    }
  };
};
