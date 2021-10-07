import { v4 as uuid } from "uuid";
import { render, getByText, fireEvent } from "@testing-library/react";
import {
  RemoveSuggestedUserAction,
  updateNewChannelModalAction,
  UpdateSearchStatusAction,
} from "../../actions/newChannelActions";

import { getFakeState, getFakeUser } from "../../utils/testHelpers";
import { NewChannelModal } from "./NewChannelModal";

/**
 * mock child components
 */
const mockSearchboxAndCardContainer = jest.fn();
jest.mock("../../components/Search/SuggestedUser/SuggestedUser");
jest.mock("../SearchboxAndCardContainer/SearchboxAndCardContainer", () => ({
  SearchboxAndCardContainer: () => <span>mock SearchboxAndCardContainer</span>,
}));

/**
 * mock redux hooks
 */
const mockDispatch = jest.fn();
const mockUseAppSelector = jest.fn();
jest.mock("../../hooks/reduxHooks", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (params: any) => mockUseAppSelector(params),
}));

// mock newChannelHooks
const mockCreateChannel = jest.fn();
const mockUpdateCreateButtonStatus = jest.fn();
jest.mock("../../hooks/newChannelHooks", () => ({
  useCreateChannel: () => mockCreateChannel,
  useUpdateCreateButtonStatus: () => ["channel1", mockUpdateCreateButtonStatus],
}));

beforeEach(() => {
  mockUseAppSelector.mockClear();
  mockSearchboxAndCardContainer.mockClear();
});

it("should render modal", () => {
  expect.assertions(1);
  mockUseAppSelector.mockReturnValue(getFakeState().newChannel);
  const { container } = render(<NewChannelModal />);
  expect(getByText(container, "mock SearchboxAndCardContainer")).toBeTruthy();
});

it("should not render modal if modal value is false", () => {
  expect.assertions(1);
  mockUseAppSelector.mockReturnValue({
    ...getFakeState().newChannel,
    modal: false,
  });
  const { container } = render(<NewChannelModal />);
  const div = container.getElementsByClassName(
    "channel-modal-background"
  )[0] as HTMLElement;
  if (!div) return;
  expect(div.style.display).toEqual("none");
});

test("handleClickBackground should work properly", () => {
  expect.assertions(2);
  mockUseAppSelector.mockReturnValue({
    ...getFakeState().newChannel,
    searchStatus: { type: "searching" },
  });
  const { container } = render(<NewChannelModal />);
  // fire click event
  fireEvent.click(
    container.getElementsByClassName("channel-modal-background")[0]
  );
  // it should hide suggestion card list
  expect(mockDispatch).toHaveBeenCalledWith(
    UpdateSearchStatusAction({ type: "hidden" })
  );
  // it should hide modal
  expect(mockDispatch).toHaveBeenCalledWith(updateNewChannelModalAction(false));
});

test("handleClickBackground should not dispatch updateNewChannelModalAction if condition is not met", () => {
  expect.assertions(1);
  mockUseAppSelector.mockReturnValue({
    ...getFakeState().newChannel,
    searchStatus: { type: "hidden" },
  });
  const { container } = render(<NewChannelModal />);
  const div = container.getElementsByClassName("channel-modal-form")[0];
  if (!div) throw new Error("failed to query div");
  // fire click event
  fireEvent.click(div);
  // it should only dispatch updateNewChannelModalAction
  expect(mockDispatch).toHaveBeenCalledTimes(0);
});

test("handleClickBackground should not dispatch UpdateSearchStatusAction if condition is not met", () => {
  expect.assertions(1);
  mockUseAppSelector.mockReturnValue({
    ...getFakeState().newChannel,
    searchStatus: { type: "hidden" },
  });
  const { container } = render(<NewChannelModal />);
  // fire click event
  fireEvent.click(
    container.getElementsByClassName("channel-modal-background")[0]
  );
  // it should only dispatch updateNewChannelModalAction
  expect(mockDispatch).toHaveBeenCalledTimes(1);
});

test("useUpdateCreateButtonStatus works properly", () => {
  expect.assertions(1);
  mockUseAppSelector.mockReturnValue(getFakeState().newChannel);
  const { container } = render(<NewChannelModal />);
  const input = container.querySelector("#channelName");
  if (!input) throw new Error("failed to query input element");
  // fire on change event
  fireEvent.change(input, { target: { value: "changed" } });
  expect(mockUpdateCreateButtonStatus).toHaveBeenCalledWith("changed");
});

test("useCreateChannel works properly", () => {
  expect.assertions(1);
  mockUseAppSelector.mockReturnValue({
    ...getFakeState().newChannel,
    buttonDisabled: false,
  });
  const { container } = render(<NewChannelModal />);
  const input = container.querySelector("#submit");
  if (!input) throw new Error("failed to query input element");
  // fire on change event
  fireEvent.click(input);
  expect(mockCreateChannel).toHaveBeenCalledTimes(1);
});

test("clicking suggested user should dispatch RemoveSuggestedUserAction", () => {
  expect.assertions(1);
  const id = "myid";
  mockUseAppSelector.mockReturnValue({
    ...getFakeState().newChannel,
    selectedUsers: [getFakeUser(), getFakeUser(), { ...getFakeUser(), id }],
  });
  const { container } = render(<NewChannelModal />);
  const user = container.querySelector(`#${id}`);
  if (!user) throw new Error("failed to query user element");
  // fire on change event
  fireEvent.click(user);
  expect(mockDispatch).toHaveBeenCalledWith(RemoveSuggestedUserAction(id));
});
