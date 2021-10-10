import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../utils/store";

import Home from "./Home";

jest.mock("../../components/Header/Header/Header");
jest.mock("../NewChannelModal/NewChannelModal");
jest.mock("../../components/Member/MemberModal/MemberModal");
jest.mock("../../components/Column/LeftColumn/LeftColumn");
jest.mock("../../components/Column/RightColumn/RightColumn");
const mockUseAppSelector = jest.fn();

jest.mock("../../hooks/reduxHooks", () => ({
  useAppSelector: () => mockUseAppSelector(),
}));

it("should render child components", () => {
  expect.assertions(6);
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
  const nodes = childNodes[0].childNodes[1].childNodes;
  expect(nodes.length).toEqual(4);
  expect(nodes[0].textContent).toEqual("mock Header component");
  expect(nodes[1].childNodes[0].textContent).toEqual("mock LeftColumn");
  expect(nodes[1].childNodes[1].textContent).toEqual("mock RightColumn");
  expect(nodes[2].textContent).toEqual("mock NewChannelModal component");
  expect(nodes[3].textContent).toEqual("mock MemberModal component");
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
