import { render, fireEvent } from "@testing-library/react";
import { getFakeState } from "../../../utils/testHelpers";

import { Header } from "./Header";

// mock reduxHooks
const mockUseAppSelector = jest.fn();
jest.mock("../../../hooks/reduxHooks", () => ({
  useAppSelector: () => mockUseAppSelector(),
}));

// mock userHooks
const mockToggleUserModal = jest.fn();
jest.mock("../../../hooks/userHooks", () => ({
  useToggleUserModal: () => mockToggleUserModal,
}));

beforeEach(() => {
  mockUseAppSelector.mockClear();
});

it("should display company profile", () => {
  expect.assertions(1);
  mockUseAppSelector.mockReturnValue(getFakeState().user);
  const { container } = render(<Header />);
  expect(
    container.getElementsByClassName("header__companyProfile")[0].textContent
  ).toEqual("Chat App");
});

it("should display displayName and profile picture", () => {
  expect.assertions(2);
  const userState = getFakeState().user;
  mockUseAppSelector.mockReturnValue(userState);
  const { container } = render(<Header />);
  // check profilePhotoURL
  expect(container.getElementsByTagName("img")[0].src).toEqual(
    userState.userInfo?.profilePhotoURL
  );
  // check displayName
  expect(
    container.getElementsByClassName("header__displayName")[0].textContent
  ).toEqual(userState.userInfo?.displayName);
});

it("should invoke toggle callback when profile is clicked", () => {
  expect.assertions(1);
  const userState = getFakeState().user;
  mockUseAppSelector.mockReturnValue(userState);
  const { container } = render(<Header />);
  // get angle-down element
  const element = container.getElementsByClassName(
    "header__profileContainer"
  )[0];
  if (!element) throw new Error("failed to get profile element");
  // click the element
  fireEvent.click(element);
  // validate callback
  expect(mockToggleUserModal).toHaveBeenCalledWith({ enable: true });
});
