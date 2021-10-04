import * as actions from "../newChannelActions";

describe("DeleteChannelAction", () => {
  it("should return DeleteChannelActionType", () => {
    expect.assertions(1);
    expect(actions.DeleteChannelAction("abcd")).toEqual({
      type: "newChannel/deleteChannel",
      payload: { channelId: "abcd" },
    });
  });
});
