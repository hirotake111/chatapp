import { it, expect } from "@jest/globals";
import { render } from "@testing-library/react";

import { LoadingSpinner2 } from "./LoadingSpinner2";

it("should display a loading spinner", () => {
  expect.assertions(1);
  const { container } = render(<LoadingSpinner2 />);
  if (!container.firstChild) throw new Error("no HTML element");
  expect(
    container.getElementsByClassName("dotted-spinner")[0].nodeType
  ).toEqual(1);
});
