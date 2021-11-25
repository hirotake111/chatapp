import {
  GetChannelDetailAction,
  GetMyChannelsAction,
} from "../actions/channelActions";
import { getFakeChannel } from "../utils/testHelpers";
import { useFetchChannelDetail, useGetMyChannels } from "./channelHooks";

const mockDispatch = jest.fn();
const mockUseAppSelector = jest.fn();
const mockFetchMyChannel = jest.fn();
const mockFetchChannelDetailPayload = jest.fn();

jest.mock("./reduxHooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: () => mockUseAppSelector(),
}));

jest.mock("../utils/network", () => ({
  fetchMyChannels: () => mockFetchMyChannel(),
  fetchChannelDetailPayload: () => mockFetchChannelDetailPayload(),
}));

describe("useGetMyChannels", () => {
  it("should dispatch GetMyChannelsAction and ToggleChannelLoadingAction", async () => {
    expect.assertions(3);
    const fakeChannels = [getFakeChannel(), getFakeChannel(), getFakeChannel()];
    mockUseAppSelector.mockReturnValue(fakeChannels);
    mockFetchMyChannel.mockReturnValue(fakeChannels);
    const [channels, get] = useGetMyChannels();
    expect(channels).toEqual(fakeChannels);
    await get();
    expect(mockDispatch).toHaveBeenCalledWith(
      GetMyChannelsAction(fakeChannels)
    );
    expect(mockDispatch).toHaveBeenCalledTimes(3);
  });

  it("should not dispatch highlight action if user has no channels joined", async () => {
    expect.assertions(2);
    const fakeChannels: ChannelPayload[] = [];
    mockUseAppSelector.mockReturnValue(fakeChannels);
    mockFetchMyChannel.mockReturnValue(fakeChannels);
    const [channels, get] = useGetMyChannels();
    expect(channels).toEqual(fakeChannels);
    await get();
    expect(mockDispatch).toHaveBeenCalledTimes(2);
  });

  it("should console.error if network call faield", async () => {
    expect.assertions(1);
    console.error = jest.fn();
    const err = new Error("unable to reach server");
    mockFetchMyChannel.mockImplementation(() => {
      throw err;
    });
    try {
      const [, get] = useGetMyChannels();
      await get();
      expect(console.error).toHaveBeenCalledWith(err);
    } catch (e) {
      throw e;
    }
  });
});

describe("useFetchChannelDetail", () => {
  it("should dispatch GetChannelDetailAcion", async () => {
    expect.assertions(1);
    const channel = getFakeChannel();
    mockFetchChannelDetailPayload.mockReturnValue(channel);
    const fetch = useFetchChannelDetail();
    await fetch(channel.id);
    expect(mockDispatch).toHaveBeenCalledWith(GetChannelDetailAction(channel));
  });

  it("should console.error if network call faield", async () => {
    expect.assertions(1);
    console.error = jest.fn();
    const err = new Error("unable to reach server");
    mockFetchChannelDetailPayload.mockImplementation(() => {
      throw err;
    });
    const fetch = useFetchChannelDetail();
    await fetch("xx-xx-xx-xx");
    expect(console.error).toHaveBeenCalledWith(err);
  });
});
