import { getCheckMember } from "./utils";
import { UserQuery } from "../queries/userQuery";

describe("checkMember", () => {
  let checkMember: (channelId: string, requesterId: string) => Promise<boolean>;
  let query: UserQuery;
  beforeEach(() => {
    query = {
      getOtherUsers: jest.fn(),
      getUserById: jest.fn(),
      getUserByUsername: jest.fn(),
      getUsersByChannelId: jest
        .fn()
        .mockReturnValue([{ id: "alice" }, { id: "bob" }, { id: "user" }]),
      createUser: jest.fn(),
      deleteUserById: jest.fn(),
    };
    checkMember = getCheckMember(query);
  });

  it("should return true if requester is a member of channel", async () => {
    expect.assertions(1);
    expect(await checkMember("channel", "user")).toEqual(true);
  });

  it("should return false if requester is not a member of channel", async () => {
    expect.assertions(1);
    expect(await checkMember("channel", "userx")).toEqual(false);
  });

  it("should throw an error for any other reason", async () => {
    expect.assertions(1);
    query.getUsersByChannelId = jest.fn().mockImplementation(() => {
      throw new Error("err");
    });
    try {
      await checkMember("ch", "user");
    } catch (e) {
      if (e instanceof Error) expect(e.message).toEqual("err");
    }
  });
});
