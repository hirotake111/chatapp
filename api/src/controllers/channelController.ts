import { RequestHandler, Request, Response } from "express";
import { ChannelQuery } from "../queries/channelQuery";

export interface ChannelController {
  postChannel: RequestHandler;
  getChannel: RequestHandler;
}

export const getChannelController = (params: {
  query: ChannelQuery;
}): ChannelController => {
  return {
    postChannel: async (req: Request, res: Response) => {
      try {
        throw new Error("not implemented");
      } catch (e) {
        res
          .status(500)
          .send({ error: "INTERNAL SERVER ERROR", detail: e.message });
        return;
      }
    },

    getChannel: async (req: Request, res: Response) => {
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
