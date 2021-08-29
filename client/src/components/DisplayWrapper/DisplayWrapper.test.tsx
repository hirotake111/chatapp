import "@testing-library/jest-dom";
import { test, expect, it, describe } from "@jest/globals";

import { DisplayWrapper } from "./DisplayWrapper";
import { render, screen } from "@testing-library/react";

describe("DisplayWrapper", () => {
  it("should render underline compoents if showMessage is false", async () => {
    const result = render(
      <DisplayWrapper showMessage={false} message="message1">
        children
      </DisplayWrapper>
    );
    expect(result.container.textContent).toBe("children");
  });

  it("should render message if showMessage is true", async () => {
    const result = render(
      <DisplayWrapper showMessage={true} message="message1">
        children
      </DisplayWrapper>
    );
    expect(result.container.textContent).toBe("message1");
  });
});
