import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../utils/store";

import Home from "./Home";

jest.mock("../../components/Common/Header/Header");
jest.mock("../MainContainer/MainContainer");
jest.mock("../NewChannelModal/NewChannelModal");
jest.mock("../../components/Member/MemberModal/MemberModal");

const mockUseAppSelector = jest.fn();

jest.mock("../../hooks/reduxHooks", () => ({
  useAppSelector: () => mockUseAppSelector(),
}));

it("should render child components", () => {
  expect.assertions(5);
  mockUseAppSelector.mockReturnValue({
    userInfo: { userId: "xxxx", username: "alice" },
  });
  const {
    container: { childNodes },
  } = render(
    <Provider store={store}>
      <Home />
    </Provider>
  );
  expect(childNodes.length).toEqual(4);
  expect(childNodes[0].textContent).toEqual("mock Header component");
  expect(childNodes[1].textContent).toEqual("mock MainContainer component");
  expect(childNodes[2].textContent).toEqual("mock NewChannelModal component");
  expect(childNodes[3].textContent).toEqual("mock MemberModal component");
});

it("should render 'no username or user ID' message if userId is not provided", () => {
  expect.assertions(1);
  mockUseAppSelector.mockReturnValue({
    userInfo: { userId: null, username: "alice" },
  });
  const {
    container: { firstChild },
  } = render(
    <Provider store={store}>
      <Home />
    </Provider>
  );
  expect(firstChild?.textContent).toEqual("No username or user ID");
});
