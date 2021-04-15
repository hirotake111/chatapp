import { Request, Response, NextFunction } from "express";
import { getController } from "./controller";

const ctlr = getController({} as any, {} as any);

describe("getController", () => {
  describe("getRoot", () => {
    it("should return OK message", () => {
      // const res = {
      //   status: (statuCode: number) => res,
      //   send: (body: any) => {},
      // } as Response;
      // ctlr.getRoot({} as any, res);
      // expect(res.status).toHaveBeenCalledTimes(1);
      // expect(res.send).toHaveBeenCalledTimes(1);
    });
  });
});
