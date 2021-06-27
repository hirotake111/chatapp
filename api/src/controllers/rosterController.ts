import { RequestHandler, Request, Response } from "express";
import { validate as uuidValidate } from "uuid";

import { RosterQuery } from "../queries/rosterQuery";
import { UserQuery } from "../queries/userQuery";

export interface RosterController {
  addChannelMember: RequestHandler;
  removeChannelMember: RequestHandler;
}

const checkArrayOfUuidv4 = (userIds: any): string[] | null => {
  return Array.isArray(userIds) &&
    userIds.reduce((a, c) => typeof c === "string" && a, true) &&
    userIds.reduce(
      (accumulator, current) => uuidValidate(current) && accumulator,
      true
    )
    ? userIds
    : null;
};

export const getRosterContoller = ({
  rosterQuery,
  userQuery,
}: {
  rosterQuery: RosterQuery;
  userQuery: UserQuery;
}): RosterController => {
  const validateRequester = async (
    channelId: string,
    requesterId: string
  ): Promise<boolean> => {
    // check if the requester is member of the channel
    const users = (await userQuery.getUsersByChannelId(channelId)).map(
      (user) => user.id
    );
    return users.includes(requesterId);
  };

  return {
    addChannelMember: async (req: Request, res: Response) => {
      const { channelId } = req.params;
      const { userIds } = req.body;
      const { userId: requesterId } = req.session;
      const added: string[] = [];
      const skipped: string[] = [];
      // validate channelId
      if (!uuidValidate(channelId))
        return res
          .status(400)
          .send({ detail: `invalid channel ID: ${channelId}` });
      // validate userIds
      let idsToBeAdded = checkArrayOfUuidv4(userIds);
      if (!idsToBeAdded)
        return res.status(400).send({ detail: "invalid user IDs" });
      // validate requesterId
      if (!uuidValidate(requesterId))
        return res.status(400).send({ detail: "invalid requester ID" });
      try {
        // get current user IDs
        const currentUserIds = (
          await userQuery.getUsersByChannelId(channelId)
        ).map((user) => user.id);
        // check if the requester is member of the channel
        if (!(await validateRequester(channelId, requesterId)))
          return res
            .status(400)
            .send({ detail: "you are not a member of the channel" });
        // add members to the channel
        await Promise.all(
          idsToBeAdded.map((userId) => {
            if (!currentUserIds.includes(userId)) {
              added.push(userId);
              return rosterQuery.addUserToChannel(channelId, userId);
            }
            skipped.push(userId);
          })
        );
        res.status(200).send({ detail: "success", channelId, added, skipped });
        return;
      } catch (e) {
        res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
        return;
      }
    },

    removeChannelMember: async (req: Request, res: Response) => {
      const { channelId } = req.params;
      const { userIds } = req.body;
      const { userId: requesterId } = req.session;
      // validate channelId
      if (!uuidValidate(channelId))
        return res
          .status(400)
          .send({ detail: `invalid channel ID: ${channelId}` });
      // validate userIds
      const ids = checkArrayOfUuidv4(userIds);
      if (!ids) return res.status(400).send({ detail: "invalid user IDs" });
      // validate requesterId
      if (!uuidValidate(requesterId))
        return res.status(400).send({ detail: "invalid requester ID" });
      try {
        // check if the requester is member of the channel
        if (!(await validateRequester(channelId, requesterId)))
          return res
            .status(400)
            .send({ detail: "you are not a member of the channel" });
        // remove members from the channel
        await Promise.all(
          ids.map((userId) =>
            rosterQuery.deleteUserFromChannel(channelId, userId)
          )
        );
        res.status(204).send({ detail: "success", channelId, userIds });
        return;
      } catch (e) {
        res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
        return;
      }
    },
  };
};
