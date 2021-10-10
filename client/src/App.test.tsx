import { render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";

import { store } from "./utils/store";
import App from "./App";

jest.mock("./pages/Home/Home");
jest.mock("./components/Common/LoadingSpinner/LoadingSpinner");

// mock userHooks
const mockUseSingIn = jest.fn();
const mockToggle = jest.fn();
jest.mock("./hooks/userHooks", () => ({
  useSignIn: () => mockUseSingIn(),
  useToggleUserModal: () => mockToggle,
}));

beforeEach(() => {
  mockUseSingIn.mockClear();
  mockToggle.mockClear();
});

it("should render Home component if user is authenticated", () => {
  expect.assertions(1);
  mockUseSingIn.mockReturnValue([
    { isAuthenticated: true },
    () => Promise.resolve(),
  ]);
  const { container } = render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  expect(container.textContent).toEqual("Home");
});

test('renders string "LOADING NOW..." if user is no authenticated', () => {
  expect.assertions(1);
  const signin = () => Promise.resolve(true);
  const user = {
    isAuthenticated: false,
    userInfo: { userId: "123", username: "alice" },
  };
  const returnValue = [user, signin] as const;
  mockUseSingIn.mockReturnValue(returnValue);
  const { container } = render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  expect(container.firstChild?.textContent).toEqual("LOADING NOW...");
});

it("should display not device supported message if window size is less than 400px", () => {
  expect.assertions(1);
  global.innerWidth = 300;
  mockUseSingIn.mockReturnValue([{}, jest.fn()]);
  const { container } = render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  expect(container.firstChild?.textContent).toEqual(
    "Unforunately, mobile device is not supported now."
  );
});

it("should invoke toggle callback when window is clicked", () => {
  expect.assertions(1);
  mockUseSingIn.mockReturnValue([{}, jest.fn()]);
  // get element
  const { container } = render(<App />);
  if (!container.firstChild) throw new Error("faield to get element");
  // click window
  fireEvent.click(container.firstChild);
  // vlaidate
  expect(mockToggle).toHaveBeenCalledWith({ enable: false });
});

it("should NOT invoke toggle callback when inside of .profile-modal is clicked", () => {
  expect.assertions(1);
  mockUseSingIn.mockReturnValue([{}, jest.fn()]);
  // get element
  const { container } = render(
    <div className="profile-modal">
      <App />
    </div>
  );
  if (!container.firstChild) throw new Error("faield to get element");
  // click window
  fireEvent.click(container.firstChild);
  // vlaidate
  expect(mockToggle).toHaveBeenCalledTimes(0);
});
