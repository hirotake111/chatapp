import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

it("should invoke onClick callback", () => {
  expect.assertions(1);
  const callback = jest.fn();
  render(<Button onClick={callback} value="click me" enabled={true} />);
  const button = screen.getByText("click me");
  fireEvent.click(button);
  expect(callback).toHaveBeenCalledTimes(1);
});

it("should not invoke onClick callback if button is disabled", () => {
  expect.assertions(1);
  const callback = jest.fn();
  render(<Button onClick={callback} value="click me" enabled={false} />);
  const button = screen.getByText("click me");
  fireEvent.click(button);
  expect(callback).toBeCalledTimes(0);
});
