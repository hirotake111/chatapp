import { nanoid } from "nanoid";
import { v4 as uuid } from "uuid";

import { getController } from "./controller";

const config = {
  oidc: {
    client: {},
  },
  generator: {},
} as any;
const services = {} as any;
const ctlr = getController(config, services);

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
      // invoke function
      ctlr.getRoot(req, res);
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(statusMock.mock.calls[0][0]).toEqual(200);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(sendMock.mock.calls[0][0]).toEqual({ message: "OK" });
    });
  });

  describe("getuserInfo", () => {
    it("should respond id and username", () => {
      expect.assertions(4);
      // set mock
      const userId = uuid();
      const username = nanoid();
      const request = { session: { userId, username } } as any;
      // invoke function
      ctlr.getUserinfo(request, res);
      // validation
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(statusMock.mock.calls[0][0]).toEqual(200);
      expect(sendMock.mock.calls[0][0]).toEqual({ userId, username });
    });

    it("should respond 401 and login endpoint", () => {
      expect.assertions(4);
      // invoke function
      ctlr.getUserinfo({ session: {} } as any, res);
      // validation
      expect(res.status).toHaveBeenCalledTimes(1);
      expect(statusMock.mock.calls[0][0]).toEqual(401);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(sendMock.mock.calls[0][0]).toEqual({
        mesaage: "UNAUTHORIZED",
        location: "/login",
      });
    });
  });
});
