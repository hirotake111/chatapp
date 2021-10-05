import { updateCreateButtonAction } from "../actions/newChannelActions";
import { getFakeState, getFakeUser } from "../utils/testHelpers";
import { useUpdateCreateButtonStatus } from "./newChannelHooks";

// mock redux hooks
const mockUseAppSelector = jest.fn();
const mockDispatch = jest.fn();
jest.mock("./reduxHooks", () => ({
  useAppSelector: (params: any) => mockUseAppSelector(params),
  useAppDispatch: (params: any) => mockDispatch,
}));

beforeEach(() => {
  mockUseAppSelector.mockClear();
  mockDispatch.mockClear();
});

describe("useUpdateCreateButtonStatus", () => {
  it("should dispatch updateCreateButtonAction with value true if condition mathes", () => {
    expect.assertions(2);
    mockUseAppSelector.mockReturnValue(getFakeState().newChannel);
    const update = useUpdateCreateButtonStatus();
    update();
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      updateCreateButtonAction({ disable: false })
    );
  });

  it("should dispatch updateCreateButtonAction with value false if condion matches", () => {
    expect.assertions(2);
    mockUseAppSelector.mockReturnValue({
      ...getFakeState().newChannel,
      buttonDisabled: false,
      channelName: "abc",
    });
    const update = useUpdateCreateButtonStatus();
    update();
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      updateCreateButtonAction({ disable: true })
    );
  });

  it("should not dispatch if button is initially disabled and channelName changes empty", () => {
    expect.assertions(1);
    mockUseAppSelector.mockReturnValue({
      ...getFakeState().newChannel,
      buttonDisabled: true,
      channelName: "",
    });
    const update = useUpdateCreateButtonStatus();
    update();
    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });

  it("should not dispatch if button is initially enabled and selectedUsers has at leat 1 user", () => {
    expect.assertions(1);
    mockUseAppSelector.mockReturnValue({
      ...getFakeState().newChannel,
      buttonDisabled: false,
      selecteUsers: [getFakeUser()],
    });
    const update = useUpdateCreateButtonStatus();
    update();
    expect(mockDispatch).toHaveBeenCalledTimes(0);
  });
});
