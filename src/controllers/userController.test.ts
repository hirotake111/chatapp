import { nanoid } from "nanoid";

import { getUserController } from "./userController";

// constants
const verifier = nanoid();
const code_challenge = nanoid();
const parameters = {
  scope: "openid email profile",
  code_challenge,
  code_challenge_method: "S256",
};
const authzUrl = `https://${nanoid()}.com`;
const accessToken = nanoid();
const userInfo = {
  sub: nanoid(),
  name: nanoid(),
  displayName: nanoid(),
  fistName: nanoid(),
  lastName: nanoid(),
};

// mock ojbects
const req = { session: { username: "", userId: "", verifier: "xxxx" } } as any;
const res = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
  redirect: jest.fn(),
} as any;
const redirectMock = res.redirect as jest.Mock;
const userService = {
  getUserByUsername: jest.fn(),
  createUser: jest.fn(),
} as any;
const statusMock = res.status as jest.Mock;
const sendMock = res.send as jest.Mock;
const generators = {
  codeVerifier: jest.fn().mockReturnValue(verifier),
  codeChallenge: jest.fn().mockReturnValue(code_challenge),
} as any;
const client = {
  authorizationUrl: jest.fn().mockReturnValue(authzUrl),
  callbackParams: jest.fn(),
  callback: jest.fn().mockReturnValue({ access_token: accessToken }),
  userinfo: jest.fn().mockReturnValue(userInfo),
} as any;
const challengeMock = generators.codeChallenge as jest.Mock;
const authorizationUrlMock = client.authorizationUrl as jest.Mock;

describe("userController", () => {
  describe("getLogin()", () => {
    it("should redirect user", async () => {
      expect.assertions(5);
      try {
        const uc = getUserController(client, generators, userService);
        await uc.getLogin(req, res);
        // validation
        expect(generators.codeVerifier).toHaveBeenCalledTimes(1);
        expect(req.session.verifier).toEqual(verifier);
        expect(challengeMock.mock.calls[0][0]).toEqual(verifier);
        expect(authorizationUrlMock.mock.calls[0][0]).toEqual(parameters);
        expect(redirectMock.mock.calls[0][0]).toEqual(authzUrl);
      } catch (e) {
        throw e;
      }
    });

    it("should respond 500 if any errors", async () => {
      expect.assertions(2);
      try {
        // set mocks
        const generatorsFail = {
          codeVerifier: jest.fn().mockImplementation(() => {
            throw new Error();
          }),
        } as any;
        // invoke function
        const uc = getUserController(client, generatorsFail, userService);
        await uc.getLogin(req, res);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
        expect(sendMock.mock.calls[0][0]).toEqual({
          error: "INTERNAL SERVER ERROR",
        });
      } catch (e) {
        throw e;
      }
    });
  });

  describe("getCallback()", () => {
    it("should create user and redirect to root page", async () => {
      expect.assertions(3);
      try {
        // invoke function
        const uc = getUserController(client, generators, userService);
        await uc.getCallback(req, res);
        // validation
        expect(redirectMock).toHaveBeenCalledTimes(1);
        expect(redirectMock.mock.calls[0][0]).toEqual("/");
        expect(userService.createUser).toHaveBeenCalledTimes(1);
      } catch (e) {
        throw e;
      }
    });

    it("should skip to create user and redirect to root page", async () => {
      expect.assertions(3);
      try {
        // set mocks
        const us = {
          getUserByUsername: jest.fn().mockReturnValue({ id: nanoid() }),
        } as any;
        // invoke function
        const uc = getUserController(client, generators, us);
        await uc.getCallback(req, res);
        // validation
        expect(redirectMock).toHaveBeenCalledTimes(1);
        expect(redirectMock.mock.calls[0][0]).toEqual("/");
        expect(userService.createUser).toHaveBeenCalledTimes(0);
      } catch (e) {
        throw e;
      }
    });

    it("should respond 500 if no eccess token obtained", async () => {
      expect.assertions(2);
      try {
        // set mocks
        const client = {
          authorizationUrl: jest.fn().mockReturnValue(authzUrl),
          callbackParams: jest.fn(),
          callback: jest.fn().mockReturnValue({ access_token: null }),
          userinfo: jest.fn().mockReturnValue(userInfo),
        } as any;
        // invoke function
        const uc = getUserController(client, generators, userService);
        await uc.getCallback(req, res);
        // validation
        expect(statusMock.mock.calls[0][0]).toEqual(500);
        expect(sendMock.mock.calls[0][0]).toEqual({
          error: "Cannot fetch access token from OIDC server",
        });
      } catch (e) {
        throw e;
      }
    });

    it("should respond 500 if any errors", async () => {
      expect.assertions(2);
      try {
        // set mocks
        const clientFail = {
          callbackParams: jest.fn().mockImplementation(() => {
            throw new Error();
          }),
        } as any;
        // invoke function
        const uc = getUserController(clientFail, generators, userService);
        await uc.getCallback(req, res);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
        expect(sendMock.mock.calls[0][0]).toEqual({
          error: "INTERNAL SERVER ERROR",
        });
      } catch (e) {
        throw e;
      }
    });
  });
});
