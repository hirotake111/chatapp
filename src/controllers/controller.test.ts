import { Request, Response, NextFunction } from "express";
import { getController } from "./controller";

const ctlr = getController({} as any, {} as any);

/** response mock object */
const res = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
} as any;

/** request mock object */
const req = {} as any;

const statusMock = res.status as jest.Mock;
const sendMock = res.send as jest.Mock;

describe("getController", () => {
  describe("getRoot", () => {
    it("should return OK message", () => {
      expect.assertions(4);
      ctlr.getRoot(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(statusMock.mock.calls[0][0]).toEqual(200);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(sendMock.mock.calls[0][0]).toEqual({ message: "OK" });
    });
  });
});
