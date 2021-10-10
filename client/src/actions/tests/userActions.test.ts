import * as actions from "../userActions";

describe("userSignOutAction", () => {
  it("should return UserSignOutActionType", () => {
    expect.assertions(1);
    expect(actions.userSignOutAction()).toEqual({ type: "user/signedOut" });
  });
});

describe("toggleUserProfileAction", () => {
  it("should return ToggleUserProfileActionType if showProfileModal", () => {
    expect.assertions(1);
    expect(actions.toggleUserProfileAction({ enable: true })).toEqual({
      type: "user/toggleUserProfile",
      payload: { enable: true },
    });
  });
});
