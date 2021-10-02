import { userSignInAction } from "../actions/userActions";
import { useSignIn } from "./userHooks";

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
    const userInfo = {
      userId: "xx-xx-xx-xx",
      username: "alice",
      displayName: "ALICE",
    };
    mockGetUserData.mockReturnValue(userInfo);
    const [user, signIn] = useSignIn();
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
    const [user, signIn] = useSignIn();
    await signIn();
    expect(console.error).toHaveBeenCalledWith(err);
  });
});
