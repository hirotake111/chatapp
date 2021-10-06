import {
  UpdateChannelNameAction,
  updateCreateButtonAction,
} from "../actions/newChannelActions";
import { getFakeState, getFakeUser } from "../utils/testHelpers";
import { useUpdateCreateButtonStatus } from "./newChannelHooks";

// mock redux hooks
const mockUseAppSelector = jest.fn();
const mockDispatch = jest.fn();
jest.mock("./reduxHooks", () => ({
  useAppSelector: (params: any) => mockUseAppSelector(params),
  useAppDispatch: () => mockDispatch,
}));

beforeEach(() => {
  mockUseAppSelector.mockClear();
  mockDispatch.mockClear();
});

describe("useUpdateCreateButtonStatus", () => {
  it("should dispatch updateCreateButtonAction with value true if condition mathes", () => {
    expect.assertions(3);
    mockUseAppSelector.mockReturnValue(getFakeState().newChannel);
    const [channelName, update] = useUpdateCreateButtonStatus();
    update("my team");
    expect(mockDispatch).toHaveBeenCalledWith(
      UpdateChannelNameAction("my team")
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      updateCreateButtonAction({ disable: false })
    );
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  it("should dispatch updateCreateButtonAction with value false if condion matches", () => {
    expect.assertions(3);
    mockUseAppSelector.mockReturnValue({
      ...getFakeState().newChannel,
      buttonDisabled: false,
      channelName: "my channel",
    });
    const [name, update] = useUpdateCreateButtonStatus();
    update("abc");
    expect(mockDispatch).toHaveBeenCalledWith(UpdateChannelNameAction("abc"));
    expect(mockDispatch).toHaveBeenCalledWith(
      updateCreateButtonAction({ disable: true })
    );
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  it("should not dispatch updateCreateButtonAction if button is initially disabled and channelName changes empty", () => {
    expect.assertions(2);
    mockUseAppSelector.mockReturnValue({
      ...getFakeState().newChannel,
      buttonDisabled: true,
      channelName: "asfjeek",
    });
    const [name, update] = useUpdateCreateButtonStatus();
    update("");
    expect(mockDispatch).toHaveBeenCalledWith(UpdateChannelNameAction(""));
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("should not dispatch if button is initially enabled and selectedUsers has at leat 1 user", () => {
    expect.assertions(2);
    mockUseAppSelector.mockReturnValue({
      ...getFakeState().newChannel,
      buttonDisabled: false,
      selecteUsers: [getFakeUser()],
    });
    const [name, update] = useUpdateCreateButtonStatus();
    update("test channel");
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      UpdateChannelNameAction("test channel")
    );
  });
});
