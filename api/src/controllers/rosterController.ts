import { RequestHandler, Request, Response } from "express";
import { validate as uuidValidate } from "uuid";

import { RosterQuery } from "../queries/rosterQeury";

export interface RosterController {
  addChannelMember: RequestHandler;
  removeChannelMember: RequestHandler;
}

export const getRosterContoller = ({
  rosterQuery,
}: {
  rosterQuery: RosterQuery;
}): RosterController => {
  return {
    addChannelMember: async (req: Request, res: Response) => {
      try {
        // validate input
        const { channelId } = req.params;
        if (
          !(
            channelId &&
            typeof channelId === "string" &&
            uuidValidate(channelId)
          )
        ) {
          throw new Error("parameter channelId is invalid");
        }

        // check if the requester is member of the channel
        // add member to the channel

        throw new Error("not implemented");
      } catch (e) {
        res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
        return;
      }
    },

    removeChannelMember: async (req: Request, res: Response) => {
      try {
        throw new Error("not implemented");
      } catch (e) {
        res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
        return;
      }
    },
  };
};
