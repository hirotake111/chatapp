import { render } from "@testing-library/react";
import { AppColumn } from "./AppColumn";

it("should render more than one icon", () => {
  expect.assertions(1);
  const { container } = render(<AppColumn />);
  expect(container.firstChild?.childNodes.length).toEqual(2);
});
