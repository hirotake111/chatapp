import { Request, Response, NextFunction, RequestHandler } from "express";

export const setNoCache = (req: Request, res: Response, next: NextFunction) => {
  res.set("Pragma", "no-cache");
  res.set("Cache-Control", "no-cache, no-store");
  next();
};

export const authenticateUser: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, username } = req.session;
  if (!username || !userId) {
    // UNAUTHORIZED response
    res.status(401).send({ mesaage: "UNAUTHORIZED", location: "/login" });
    return;
  }
  next();
};
