import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../utils/store";
import { getFakeChannel } from "../../utils/testHelpers";
import { LeftColumn } from "./LeftColumn";

const mockUseGetMessagesByChannelId = jest.fn();
const mockUseGetMyChannels = jest.fn();
const mockUserAppSelector = jest.fn();

jest.mock("../../components/Channel/ChannelItem/ChannelList");
// jest.mock("../../components/Common/Button/Button");
// jest.mock("../../components/Common/LoadingSpinner2/LoadingSpinner2");

jest.mock("../../hooks/messageHooks", () => ({
  useGetMessagesByChannelId: (params: any) =>
    mockUseGetMessagesByChannelId(params),
}));

jest.mock("../../hooks/channelHooks", () => ({
  useGetMyChannels: (params: any) => mockUseGetMyChannels(params),
}));

jest.mock("../../hooks/reduxHooks", () => ({
  useAppSelector: (params: any) => mockUserAppSelector(params),
}));

it("should render LeftColumn component", () => {
  expect.assertions(1);
  const channels = [getFakeChannel(), getFakeChannel()];
  mockUseGetMyChannels.mockReturnValue([channels, () => jest.fn()]);
  mockUserAppSelector.mockReturnValue({ loading: false });
  const { container } = render(
    <Provider store={store}>
      <LeftColumn />
    </Provider>
  );
  expect(container.firstChild?.firstChild?.textContent).toEqual(
    "mock ChannelList"
  );
});

it("should render render no channels message if it doesn't", () => {
  expect.assertions(1);
  const channels: ChannelPayload[] = [];
  mockUseGetMyChannels.mockReturnValue([channels, () => jest.fn()]);
  mockUserAppSelector.mockReturnValue({ loading: false });
  const { container } = render(
    <Provider store={store}>
      <LeftColumn />
    </Provider>
  );
  expect(container.firstChild?.firstChild?.textContent).toEqual(
    "You don't have any channels yet."
  );
});

it("should render LoadingSpinner if loading is true", () => {
  expect.assertions(1);
  const channels = [getFakeChannel(), getFakeChannel()];
  mockUseGetMyChannels.mockReturnValue([channels, () => jest.fn()]);
  mockUserAppSelector.mockReturnValue({ loading: true });
  const { container } = render(
    <Provider store={store}>
      <LeftColumn />
    </Provider>
  );
  expect(container.getElementsByClassName("dotted-spinner").length).toEqual(1);
});
