import { RequestHandler, Request, Response } from "express";
import { validate, v4 as uuid } from "uuid";
import { ChatConfigType } from "../config";
import { Queries } from "../queries/query";

import { RosterQuery } from "../queries/rosterQuery";
import { UserQuery } from "../queries/userQuery";
import { getCheckMember } from "./utils";

export interface RosterController {
  addChannelMember: RequestHandler;
  removeChannelMember: RequestHandler;
}

const checkArrayOfUuidv4 = (userIds: any): string[] | null => {
  return Array.isArray(userIds) &&
    userIds.reduce((a, c) => typeof c === "string" && a, true) &&
    userIds.reduce(
      (accumulator, current) => validate(current) && accumulator,
      true
    )
    ? userIds
    : null;
};

export const getRosterContoller = (
  config: ChatConfigType,
  queries: Queries
): RosterController => {
  const { userQuery, rosterQuery } = queries;
  const checkMember = getCheckMember(userQuery);

  return {
    addChannelMember: async (req: Request, res: Response) => {
      const { channelId } = req.params;
      const { userIds } = req.body;
      const { userId: requesterId, username } = req.session;
      const added: string[] = [];
      const skipped: string[] = [];
      // validate channelId
      if (!validate(channelId))
        return res
          .status(400)
          .send({ detail: `invalid channel ID: ${channelId}` });
      // validate userIds
      const idsToBeAdded = checkArrayOfUuidv4(userIds);
      if (!idsToBeAdded)
        return res.status(400).send({ detail: `invalid user IDs: ${userIds}` });
      // validate requesterId
      if (!validate(requesterId))
        return res
          .status(400)
          .send({ detail: `invalid requester ID: ${requesterId}` });
      try {
        // check if the requester is member of the channel
        if (!(await checkMember(channelId, requesterId)))
          return res
            .status(400)
            .send({ detail: "you are not a member of the channel" });
        // get current user IDs
        const currentUserIds = (
          await userQuery.getUsersByChannelId(channelId)
        ).map((user) => user.id);
        // add members to the channel
        idsToBeAdded.forEach((id) => {
          if (currentUserIds.includes(id)) {
            skipped.push(id);
          } else {
            added.push(id);
          }
        });
        if (added.length > 0) {
          // create UsersJoined event
          const event: ChatEvent = {
            id: uuid(),
            type: "UsersJoined",
            metadata: {
              traceId: uuid(),
              timestamp: Date.now(),
            },
            data: {
              addUsersToChannel: {
                channelId,
                sender: {
                  id: requesterId,
                  name: username,
                },
                memberIds: added,
              },
            },
          };
          await config.kafka.producer.send({
            topic: "chat",
            messages: [{ value: JSON.stringify(event) }],
          });
        }
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
      const { userId: requesterId, username } = req.session;
      // validate channelId
      if (!validate(channelId))
        return res
          .status(400)
          .send({ detail: `invalid channel ID: ${channelId}` });
      // validate userIds
      const ids = checkArrayOfUuidv4(userIds);
      if (!ids) return res.status(400).send({ detail: "invalid user IDs" });
      // validate requesterId
      if (!validate(requesterId))
        return res.status(400).send({ detail: "invalid requester ID" });
      try {
        // check if the requester is member of the channel
        if (!(await checkMember(channelId, requesterId)))
          return res
            .status(400)
            .send({ detail: "you are not a member of the channel" });
        if (ids.length > 0) {
          // create UsersRemoved event
          const event: ChatEvent = {
            id: uuid(),
            type: "UsersRemoved",
            metadata: {
              traceId: uuid(),
              timestamp: Date.now(),
            },
            data: {
              removeUsersFromChannel: {
                channelId,
                sender: {
                  id: requesterId,
                  name: username,
                },
                memberIds: ids,
              },
            },
          };
          await config.kafka.producer.send({
            topic: "chat",
            messages: [{ value: JSON.stringify(event) }],
          });
        }
        return res.status(204).send({ detail: "success", channelId, ids });
      } catch (e) {
        res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
        return;
      }
    },
  };
};
