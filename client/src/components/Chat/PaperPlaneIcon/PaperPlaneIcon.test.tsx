import { render, fireEvent } from "@testing-library/react";
import { PaperPlaneIcon } from "./PaperPlaneIcon";

const mockOnClick = jest.fn();

it("should render element that has fa-paper-plane class", () => {
  expect.assertions(1);
  // render it
  const { container } = render(<PaperPlaneIcon onClick={mockOnClick} />);
  // validate it
  expect(container.getElementsByClassName("fa-paper-plane").length).toEqual(1);
});

it("should invoke onClick callback when the element gets clicked", () => {
  expect.assertions(1);
  // render it
  const { container } = render(<PaperPlaneIcon onClick={mockOnClick} />);
  const elm = container.getElementsByClassName("fa-paper-plane").item(0);
  if (!elm) throw new Error("failed to render paper plane icon");
  // fire on click event
  fireEvent.click(elm);
  // validate it
  expect(mockOnClick).toHaveBeenCalledTimes(1);
});
