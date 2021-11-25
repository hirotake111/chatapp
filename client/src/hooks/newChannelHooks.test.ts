import {
  CreateChannelAction,
  UpdateChannelNameAction,
  updateCreateButtonAction,
  UpdateCreateChannelStatusAction,
  updateNewChannelModalAction,
} from "../actions/newChannelActions";
import {
  getFakeChannel,
  getFakeState,
  getFakeUser,
} from "../utils/testHelpers";
import {
  useCreateChannel,
  useUpdateCreateButtonStatus,
} from "./newChannelHooks";

// mock network module
const mockPostData = jest.fn();
const mockAsyncTimeInterval = jest.fn();
jest.mock("../utils/network", () => ({
  postData: (params: any) => mockPostData(params),
  asyncTimeInterval: () => mockAsyncTimeInterval,
}));

// mock socket module
const mockEmit = jest.fn();
jest.mock("../utils/ws/socket", () => ({
  socket: {
    emit: (data: any) => mockEmit(data),
  },
}));

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
    const [, update] = useUpdateCreateButtonStatus();
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
    const [, update] = useUpdateCreateButtonStatus();
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
    const [, update] = useUpdateCreateButtonStatus();
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
    const [, update] = useUpdateCreateButtonStatus();
    update("test channel");
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      UpdateChannelNameAction("test channel")
    );
  });
});

describe("useCreateChannel", () => {
  it("should create a new channel, then add it to state", async () => {
    expect.assertions(6);
    const channel = getFakeChannel();
    mockUseAppSelector.mockReturnValue(getFakeState().newChannel);
    mockPostData.mockResolvedValue({ channelId: channel.id });
    mockAsyncTimeInterval.mockResolvedValue(channel);
    const create = useCreateChannel();
    await create();
    // it should disable create button first
    expect(mockDispatch.mock.calls[0][0]).toEqual(
      updateCreateButtonAction({ disable: true })
    );
    // it should update create channel status
    expect(mockDispatch.mock.calls[1][0]).toEqual(
      UpdateCreateChannelStatusAction("Creating new channel...")
    );
    // it should hide modal
    expect(mockDispatch.mock.calls[2][0]).toEqual(
      updateNewChannelModalAction(false)
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      updateNewChannelModalAction(false)
    );
    // it should update channel state
    expect(mockDispatch).toHaveBeenCalledWith(CreateChannelAction(channel));
    // it should invoke socket.emit
    expect(mockEmit).toHaveBeenCalledWith("join new room");
  });

  it("should console.error message if POST request failed", async () => {
    expect.assertions(1);
    const temp = console.error;
    console.error = jest.fn();
    const err = new Error("HTTP 500 from server");
    mockUseAppSelector.mockReturnValue(getFakeState().newChannel);
    mockPostData.mockRejectedValue(err);
    const create = useCreateChannel();
    await create();
    expect(console.error).toHaveBeenCalledWith(err);
    console.error = temp;
  });

  it("should console.error message if POST response has no channel ID", async () => {
    expect.assertions(1);
    const temp = console.error;
    const err = new Error("couldn't get new channel ID from server");
    console.error = jest.fn();
    mockUseAppSelector.mockReturnValue(getFakeState().newChannel);
    mockPostData.mockResolvedValue({});
    const create = useCreateChannel();
    await create();
    expect(console.error).toHaveBeenCalledWith(err);
    console.error = temp;
  });

  it("should dispatch UpdateCreateChannelStatusAction if get request failed", async () => {
    expect.assertions(2);
    const temp = console.error;
    const channel = getFakeChannel();
    const err = new Error("couldn't get new channel ID from server");
    console.error = jest.fn();
    mockUseAppSelector.mockReturnValue(getFakeState().newChannel);
    mockPostData.mockResolvedValue({ channelId: channel.id });
    mockAsyncTimeInterval.mockRejectedValue(err);
    const create = useCreateChannel();
    await create();
    expect(mockDispatch).toHaveBeenCalledWith(
      UpdateCreateChannelStatusAction("Error: failed to create channel")
    );
    expect(console.error).toHaveBeenCalledWith(err);
    console.error = temp;
  });
});
