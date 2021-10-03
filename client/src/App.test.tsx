// import { test, expect, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import { store } from "./utils/store";
import App from "./App";
import { Provider } from "react-redux";

const mockUseSingIn = jest.fn();

jest.mock("./hooks/userHooks", () => ({
  useSignIn: () => mockUseSingIn(),
}));

beforeEach(() => {
  mockUseSingIn.mockClear();
});

test('renders string "No username or user ID"', () => {
  expect.assertions(1);
  const signin = () => Promise.resolve(true);
  const user = {
    isAuthenticated: true,
    userInfo: { userId: "123", username: "alice" },
  };
  const returnValue = [user, signin] as const;
  mockUseSingIn.mockReturnValue(returnValue);

  const { container } = render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  expect(container.firstChild?.textContent).toEqual("No username or user ID");
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
