import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

it("should display username and user ID", () => {
  expect.assertions(1);
  const result = render(<Header username="alice" userId="xx-xx-xx-xx" />);
  expect(result.container.textContent).toEqual(
    "Chat App (alice - xx-xx-xx-xx)"
  );
});
