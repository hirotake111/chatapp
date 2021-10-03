import { GetMyChannelsAction } from "../actions/channelActions";
import { getFakeChannel } from "../utils/testHelpers";
import { useGetMyChannels } from "./channelHooks";

const mockDispatch = jest.fn();
const mockUseAppSelector = jest.fn();
const mockFetchMyChannel = jest.fn();

jest.mock("./reduxHooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => mockUseAppSelector(),
}));

jest.mock("../utils/network", () => ({
  fetchMyChannels: () => mockFetchMyChannel(),
}));

describe("useGetMyChannels", () => {
  it("should dispatch GetMyChannelsAction adn ToggleChannelLoadingAction", async () => {
    expect.assertions(2);
    const fakeChannels = [getFakeChannel(), getFakeChannel(), getFakeChannel()];
    mockUseAppSelector.mockReturnValue(fakeChannels);
    mockFetchMyChannel.mockReturnValue(fakeChannels);
    const [channels, get] = useGetMyChannels();
    expect(channels).toEqual(fakeChannels);
    await get();
    expect(mockDispatch).toHaveBeenCalledWith(
      GetMyChannelsAction(fakeChannels)
    );
  });

  it("should console.error if network call faield", async () => {
    expect.assertions(1);
    console.error = jest.fn();
    const err = new Error("unable to reach server");
    mockFetchMyChannel.mockImplementation(() => {
      throw err;
    });
    try {
      const [_, get] = useGetMyChannels();
      await get();
      expect(console.error).toHaveBeenCalledWith(err);
    } catch (e) {
      throw e;
    }
  });
});
