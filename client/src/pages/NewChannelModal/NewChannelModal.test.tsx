import { render, getByText } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../utils/store";
import { getFakeState } from "../../utils/testHelpers";
import { NewChannelModal } from "./NewChannelModal";

// fake state
const state = getFakeState();

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
  useAppDispatch: (params: any) => () => mockDispatch,
  useAppSelector: (params: any) => mockUseAppSelector(params),
}));

beforeEach(() => {
  mockUseAppSelector.mockClear();
  mockSearchboxAndCardContainer.mockClear();
});

it("should render modal", () => {
  expect.assertions(1);
  mockUseAppSelector.mockReturnValue(state.newChannel);
  const { container } = render(
    <Provider store={store}>
      <NewChannelModal />
    </Provider>
  );
  expect(getByText(container, "mock SearchboxAndCardContainer")).toBeTruthy();
});

// test("handleClickBackground should work properly", () => {
//   expect.assertions(1);
//   mockUseAppSelector.mockReturnValue(state.newChannel);
//   const { container } = render(
//     <Provider store={store}>
//       <NewChannelModal />
//     </Provider>
//   );
//   expect(getByText(container, "mock SearchboxAndCardContainer")).toBeTruthy();
// });
