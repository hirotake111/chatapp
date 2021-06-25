import { RequestHandler, Request, Response, NextFunction } from "express";

import { MessageQuery } from "../queries/messageQuery";

export interface MessageController {
  getMessagesInChannel: RequestHandler;
  getSpecificMessageInChannel: RequestHandler;
  postMessage: RequestHandler;
  editMessage: RequestHandler;
  deleteMessage: RequestHandler;
}

export const getMessageController = ({
  messageQuery,
}: {
  messageQuery: MessageQuery;
}): MessageController => {
  return {
    getMessagesInChannel: async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        throw new Error("not implemented");
      } catch (e) {
        return res.status(500).send({ detail: e.message });
      }
    },
    getSpecificMessageInChannel: async (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      try {
        throw new Error("not implemented");
      } catch (e) {
        return res.status(500).send({ detail: e.message });
      }
    },
    postMessage: async (req: Request, res: Response, next: NextFunction) => {
      try {
        throw new Error("not implemented");
      } catch (e) {
        return res.status(500).send({ detail: e.message });
      }
    },
    editMessage: async (req: Request, res: Response, next: NextFunction) => {
      try {
        throw new Error("not implemented");
      } catch (e) {
        return res.status(500).send({ detail: e.message });
      }
    },
    deleteMessage: async (req: Request, res: Response, next: NextFunction) => {
      try {
        throw new Error("not implemented");
      } catch (e) {
        return res.status(500).send({ detail: e.message });
      }
    },
  };
};
