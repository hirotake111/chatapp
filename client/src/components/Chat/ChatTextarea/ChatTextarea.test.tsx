import { render, screen, getByRole, fireEvent } from "@testing-library/react";
import { ChatTextarea } from "./ChatTextarea";

const mockOnChange = jest.fn();
const mockOnKeyPress = jest.fn();

beforeEach(() => {
  mockOnChange.mockClear();
  mockOnKeyPress.mockClear();
});

it("should render textarea element", async () => {
  expect.assertions(1);
  // render it
  const { container } = render(
    <ChatTextarea
      content="hey"
      onChange={mockOnChange}
      onKeyPress={mockOnKeyPress}
    />
  );
  expect(getByRole(container, "textbox").textContent).toEqual("hey");
});

it("should kick onChange callback when onChange event occurs", () => {
  expect.assertions(1);
  // render it
  const { container } = render(
    <ChatTextarea
      content="hey"
      onChange={mockOnChange}
      onKeyPress={mockOnKeyPress}
    />
  );
  // fire on change event
  fireEvent.change(getByRole(container, "textbox"), {
    target: { value: "aa" },
  });
  expect(mockOnChange).toHaveBeenCalledWith("aa");
});

it("should kick onKeyPress callback when onKeyPress event occurs", () => {
  expect.assertions(1);
  // render it
  const { container } = render(
    <ChatTextarea
      content="hey"
      onChange={mockOnChange}
      onKeyPress={mockOnKeyPress}
    />
  );
  // fire on key press event
  fireEvent.keyPress(getByRole(container, "textbox"), {
    charCode: 13,
  });
  expect(mockOnKeyPress).toHaveBeenCalledTimes(1);
});
