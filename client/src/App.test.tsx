import { test, expect, jest } from "@jest/globals";
import { render } from "@testing-library/react";
import { store } from "./utils/store";
import App from "./App";
import { Provider } from "react-redux";

test('renders string "No username or user ID"', () => {
  expect.assertions(1);
  const callback = jest.fn();
  const { container } = render(
    <Provider store={store}>
      <App user={{ isAuthenticated: true }} signin={callback} />
    </Provider>
  );
  expect(container.firstChild?.textContent).toEqual("No username or user ID");
});

test('renders string "LOADING NOW..."', () => {
  expect.assertions(1);
  const callback = jest.fn();
  const { container } = render(
    <Provider store={store}>
      <App user={{ isAuthenticated: false }} signin={callback} />
    </Provider>
  );
  expect(container.firstChild?.textContent).toEqual("LOADING NOW...");
});
