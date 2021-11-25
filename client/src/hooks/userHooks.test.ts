import {
  toggleUserProfileAction,
  userSignInAction,
} from "../actions/userActions";
import { getFakeState } from "../utils/testHelpers";
import { useSignIn, useToggleUserModal } from "./userHooks";

const mockDispatch = jest.fn();
const mockSelector = jest.fn();
const mockGetUserData = jest.fn();
const mockRegisterWebSocketEventHandlers = jest.fn();

// mock useAppDispatch
jest.mock("./reduxHooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => mockSelector(),
}));

// mock getUserData
jest.mock("../utils/network", () => ({
  getUserData: () => Promise.resolve(mockGetUserData()),
}));

// mock registerWSEventHandlers
jest.mock("../utils/ws/eventHandlers", () => ({
  registerWebSocketEventHandlers: (data: any) =>
    mockRegisterWebSocketEventHandlers(data),
}));

describe("useSignIn", () => {
  it("should return user state", async () => {
    expect.assertions(1);
    mockSelector.mockReturnValue("fakeuserstate");
    const [user, signIn] = useSignIn();
    await signIn();
    expect(user).toEqual("fakeuserstate");
  });

  it("should dispatch userSignInAction", async () => {
    expect.assertions(1);
    // set fake userInfo
    const userInfo = getFakeState().user.userInfo;
    if (!userInfo) throw new Error("userInfo is undefined");
    mockGetUserData.mockReturnValue(userInfo);
    const [, signIn] = useSignIn();
    await signIn();
    expect(mockDispatch).toHaveBeenCalledWith(userSignInAction(userInfo));
  });

  it("should console.error if network call failed", async () => {
    expect.assertions(1);
    console.error = jest.fn();
    const err = new Error("network error probably");
    mockGetUserData.mockImplementation(() => {
      throw err;
    });
    const [, signIn] = useSignIn();
    await signIn();
    expect(console.error).toHaveBeenCalledWith(err);
  });
});

describe("useToggleUserModal", () => {
  it("should dispatch toggleUserProfileAction with payload {enable: true} if showProfileModal state is false", () => {
    expect.assertions(1);
    mockSelector.mockReturnValue({
      ...getFakeState().user,
      showProfileModal: false,
    });
    const toggle = useToggleUserModal();
    toggle({ enable: true });
    expect(mockDispatch).toHaveBeenCalledWith(
      toggleUserProfileAction({ enable: true })
    );
  });

  it("should not dispatch toggleUserProfileAction with payload {enable: true} if showProfileModal state is true", () => {
    expect.assertions(1);
    mockSelector.mockReturnValue({
      ...getFakeState().user,
      showProfileModal: true,
    });
    const toggle = useToggleUserModal();
    toggle({ enable: true });
    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });

  it("should dispatch toggleUserProfileAction with payload {enable: false} if showProfileModal state is true", () => {
    expect.assertions(1);
    mockSelector.mockReturnValue({
      ...getFakeState().user,
      showProfileModal: true,
    });
    const toggle = useToggleUserModal();
    toggle({ enable: false });
    expect(mockDispatch).toHaveBeenCalledWith(
      toggleUserProfileAction({ enable: false })
    );
  });

  it("should not dispatch toggleUserProfileAction with payload {enable: false} if showProfileModal state is false", () => {
    expect.assertions(1);
    mockSelector.mockReturnValue({
      ...getFakeState().user,
      showProfileModal: false,
    });
    const toggle = useToggleUserModal();
    toggle({ enable: false });
    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });
});
