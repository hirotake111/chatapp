import * as actions from "../channelActions";

describe("UpdateMemberButtonEnabledAction", () => {
  it("should return UpdateMemberButtonEnabledActionType", () => {
    expect.assertions(1);
    expect(actions.UpdateMemberButtonEnabledAction(true)).toEqual({
      type: "channel/UpdateMemberButtonEnabled",
      payload: { enabled: true },
    });
  });
});
