import { nanoid } from "nanoid";
import { Issuer } from "openid-client";
import { getIssuer, getOIDCClient } from "./oidc";

// constants
const issuerUrl = `https://${nanoid()}.com`;
const metadata = { a: nanoid(), b: nanoid() } as any;

// // mock objects
jest.mock("openid-client", () => {
  return {
    Issuer: {
      discover: jest.fn().mockReturnValue(1),
    },
  };
});

const fakeClient = { type: "OIDC Client" };
const issuerInstance = {
  Client: jest.fn().mockImplementation(() => fakeClient),
} as any;
const clientMock = issuerInstance.Client as jest.Mock;

describe("getIssuer()", () => {
  it("should return Issuer", async () => {
    expect.assertions(3);
    const tmp = console.log;
    console.log = jest.fn();
    try {
      const discoverMock = Issuer.discover as jest.Mock;
      const issuer = await getIssuer(issuerUrl);
      expect(issuer).toEqual(1);
      expect(discoverMock.mock.calls[0][0]).toEqual(issuerUrl);
      expect(discoverMock).toHaveBeenCalledTimes(1);
    } catch (e) {
      throw e;
    } finally {
      console.log = tmp;
    }
  });

  it("should raise an error", async () => {
    expect.assertions(1);
    const tmp = console.log;
    console.log = jest.fn();
    const msg = "FAILED TO DISCOVER ISSUER!";
    try {
      const url = `https://${nanoid()}.com`;
      jest.spyOn(Issuer, "discover").mockImplementation(() => {
        throw new Error(msg);
      });
      await getIssuer(issuerUrl);
    } catch (e) {
      if (e instanceof Error) expect(e.message).toEqual(msg);
    } finally {
      console.log = tmp;
    }
  });
});

describe("getOIDCClient()", () => {
  it("should return OIDC client", async () => {
    expect.assertions(3);
    try {
      const client = await getOIDCClient(issuerInstance, metadata);
      expect(client).toEqual(fakeClient);
      expect(clientMock).toHaveBeenCalledTimes(1);
      expect(clientMock.mock.calls[0][0]).toEqual(metadata);
    } catch (e) {
      throw e;
    }
  });

  it("should raise an error", async () => {
    expect.assertions(1);
    const msg = "ERROR CREATING OIDC CLIENT";
    const issuerFail = {
      Client: jest.fn().mockImplementation(() => {
        throw new Error(msg);
      }),
    } as any;
    try {
      await getOIDCClient(issuerFail, metadata);
    } catch (e) {
      if (e instanceof Error) expect(e.message).toEqual(msg);
    }
  });
});
