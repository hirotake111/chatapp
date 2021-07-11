import { nanoid } from "nanoid";
import { createHash } from "crypto";
import { v4 as uuid } from "uuid";

import { getUserController, UserController } from "./userController";

// constants
const verifier = nanoid();
const codeChallenge = nanoid();
const parameters = {
  scope: "openid email profile",
  code_challenge: codeChallenge,
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
let req = { session: { username: "", userId: "", verifier: "xxxx" } } as any;
let res = {
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
  redirect: jest.fn(),
} as any;
let next = {} as any;
const redirectMock = res.redirect as jest.Mock;
let userQuery = {
  getUserByUsername: jest.fn(),
  createUser: jest.fn(),
} as any;
let statusMock = res.status as jest.Mock;
let sendMock = res.send as jest.Mock;
const generators = {
  codeVerifier: jest.fn().mockReturnValue(verifier),
  codeChallenge: jest.fn().mockReturnValue(codeChallenge),
} as any;
const oidcClient = {
  authorizationUrl: jest.fn().mockReturnValue(authzUrl),
  callbackParams: jest.fn(),
  callback: jest.fn().mockReturnValue({ access_token: accessToken }),
  userinfo: jest.fn().mockReturnValue(userInfo),
} as any;
const config = {
  oidc: { callbackUrl: `https://${nanoid()}.com` },
  kafka: {
    topicName: nanoid(),
    producer: { send: jest.fn() },
  },
} as any;
const challengeMock = generators.codeChallenge as jest.Mock;
const authorizationUrlMock = oidcClient.authorizationUrl as jest.Mock;
const producerSendMock = config.kafka.producer.send as jest.Mock;

describe("userController", () => {
  describe("getLogin()", () => {
    it("should redirect user to authorization URL", async () => {
      expect.assertions(5);
      try {
        const uc = getUserController({
          query: userQuery,
          config,
        });
        await uc.getLogin(req, res, next);
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
        config.oidc.generators = generatorsFail;
        const uc = getUserController({
          query: userQuery,
          config,
        });
        await uc.getLogin(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
        expect(sendMock.mock.calls[0][0].error).toEqual(
          "INTERNAL SERVER ERROR"
        );
      } catch (e) {
        throw e;
      }
    });
  });

  describe("getCallback()", () => {
    it("should create createUser event and redirect to root page", async () => {
      expect.assertions(5);
      try {
        // invoke function
        const uc = getUserController({
          query: userQuery,
          config,
        });
        await uc.getCallback(req, res, next);
        // validation
        expect(producerSendMock).toHaveBeenCalledTimes(1);
        expect(producerSendMock.mock.calls[0][0].topic).toEqual(
          config.kafka.topicName
        );
        expect(
          JSON.parse(producerSendMock.mock.calls[0][0].messages[0].value)
            .metadata.hash
        ).toEqual(createHash("sha256").update(accessToken).digest("base64"));
        expect(redirectMock).toHaveBeenCalledTimes(1);
        expect(redirectMock.mock.calls[0][0]).toEqual("/");
      } catch (e) {
        throw e;
      }
    });

    it("should skip to create user and redirect to root page", async () => {
      expect.assertions(3);
      try {
        // set mocks
        const userServiceMock = {
          getUserByUsername: jest.fn().mockReturnValue({ id: nanoid() }),
          createUser: jest.fn(),
        } as any;
        // invoke function
        const uc = getUserController({
          query: userServiceMock,
          config,
        });
        await uc.getCallback(req, res, next);
        // validation
        expect(redirectMock).toHaveBeenCalledTimes(1);
        expect(redirectMock.mock.calls[0][0]).toEqual("/");
        expect(userServiceMock.createUser).toHaveBeenCalledTimes(0);
      } catch (e) {
        throw e;
      }
    });

    it("should respond 500 if no eccess token obtained", async () => {
      expect.assertions(2);
      try {
        // set mocks
        const mockClient = {
          authorizationUrl: jest.fn().mockReturnValue(authzUrl),
          callbackParams: jest.fn(),
          callback: jest.fn().mockReturnValue({ access_token: null }),
          userinfo: jest.fn().mockReturnValue(userInfo),
        } as any;
        // invoke function
        const uc = getUserController({
          query: userQuery,
          config,
        });
        await uc.getCallback(req, res, next);
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
        const uc = getUserController({
          query: userQuery,
          config,
        });
        await uc.getCallback(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
        expect(sendMock.mock.calls[0][0].error).toEqual(
          "INTERNAL SERVER ERROR"
        );
      } catch (e) {
        throw e;
      }
    });
  });

  describe("getusers()", () => {
    let controller: UserController;
    // let userQuery: UserQuery;
    // let req: Request;
    // let res: Response;
    // let next: NextFunction;
    let userId: string;
    // let statusMock: jest.Mock;
    // let sendMock: jest.Mock;

    beforeEach(() => {
      userId = uuid();
      req = { session: { userId } } as any;
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;
      next = {} as any;
      statusMock = res.status as jest.Mock;
      sendMock = res.send as jest.Mock;
      userQuery = {
        getUserById: jest.fn(),
        getOtherUsers: jest.fn().mockReturnValue([
          {
            id: uuid(),
            username: nanoid(),
            displayName: nanoid(),
            firstname: nanoid(),
            lastName: nanoid(),
          },
          {
            id: uuid(),
            username: nanoid(),
            displayName: nanoid(),
            firstname: nanoid(),
            lastName: nanoid(),
          },
        ]),
        getUserByUsername: jest.fn(),
        createUser: jest.fn(),
        deleteUserById: jest.fn(),
        getUsersByChannelId: jest.fn(),
      };
      controller = getUserController({
        query: userQuery,
        config,
      });
    });

    it("should return users", async () => {
      expect.assertions(2);
      try {
        await controller.getUsers(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(200);
        expect(sendMock.mock.calls[0][0].users.length).toEqual(2);
      } catch (e) {
        throw e;
      }
    });

    it("should validate requesterid", async () => {
      expect.assertions(2);
      req.session.userId = nanoid();
      try {
        await controller.getUsers(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0].detail).toEqual(
          "invalid requester ID"
        );
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 500 for any other errors", async () => {
      expect.assertions(2);
      const msg = "db error";
      userQuery.getOtherUsers = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await controller.getUsers(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
        expect(sendMock.mock.calls[0][0].detail).toEqual(msg);
      } catch (e) {
        throw e;
      }
    });
  });

  describe("getUserInfo", () => {
    let controller: UserController;
    // let userQuery: UserQuery;
    // let req: Request;
    // let res: Response;
    // let next: NextFunction;
    let userId: string;
    let username: string;
    let firstName: string;
    let lastName: string;
    let displayName: string;
    // let statusMock: jest.Mock;
    // let sendMock: jest.Mock;

    beforeEach(() => {
      userId = uuid();
      username = nanoid();
      displayName = nanoid();
      firstName = nanoid();
      lastName = nanoid();
      req = { session: { userId } } as any;
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;
      next = {} as any;
      statusMock = res.status as jest.Mock;
      sendMock = res.send as jest.Mock;
      userQuery = {
        getUserById: jest.fn().mockReturnValue({
          userId,
          username,
          displayName,
          firstName,
          lastName,
        }),
        getOtherUsers: jest.fn().mockReturnValue([
          {
            id: uuid(),
            username: nanoid(),
            displayName: nanoid(),
            firstname: nanoid(),
            lastName: nanoid(),
          },
          {
            id: uuid(),
            username: nanoid(),
            displayName: nanoid(),
            firstname: nanoid(),
            lastName: nanoid(),
          },
        ]),
        getUserByUsername: jest.fn(),
        createUser: jest.fn(),
        deleteUserById: jest.fn(),
        getUsersByChannelId: jest.fn(),
      };
      controller = getUserController({
        query: userQuery,
        config,
      });
    });

    it("should return user information", async () => {
      expect.assertions(2);
      try {
        await controller.getUserInfo(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(200);
        expect(sendMock.mock.calls[0][0]).toEqual({
          detail: "success",
          userId,
          username,
          displayName,
          firstName,
          lastName,
        });
      } catch (e) {
        throw e;
      }
    });

    it("should validate requesterId", async () => {
      expect.assertions(2);
      try {
        req.session.userId = nanoid();
        await controller.getUserInfo(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0]).toEqual({
          detail: "invalid requester ID",
        });
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 400 if nothing fetched from db", async () => {
      expect.assertions(2);
      try {
        userQuery.getUserById = jest.fn().mockReturnValue(null);
        await controller.getUserInfo(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(400);
        expect(sendMock.mock.calls[0][0]).toEqual({
          detail: "couldn't retrieve user info with your ID",
        });
      } catch (e) {
        throw e;
      }
    });

    it("should respond HTTP 500 for any other erros", async () => {
      expect.assertions(2);
      const msg = "db errrrrror";
      userQuery.getUserById = jest.fn().mockImplementation(() => {
        throw new Error(msg);
      });
      try {
        await controller.getUserInfo(req, res, next);
        expect(statusMock.mock.calls[0][0]).toEqual(500);
        expect(sendMock.mock.calls[0][0]).toEqual({
          error: "INTERNAL SERVER ERROR",
          detail: msg,
        });
      } catch (e) {
        throw e;
      }
    });
  });
});
