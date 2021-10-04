import * as actions from "../userActions";

describe("userSignOutAction", () => {
  it("should return UserSignOutActionType", () => {
    expect.assertions(1);
    expect(actions.userSignOutAction()).toEqual({ type: "user/signedOut" });
  });
});
