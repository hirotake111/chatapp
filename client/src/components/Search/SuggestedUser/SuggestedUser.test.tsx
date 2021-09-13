import { render, fireEvent } from "@testing-library/react";
import { SuggestedUser } from "./SuggestedUser";

describe("SuggestedUser", () => {
  it("should render SuggestedUser component", () => {
    expect.assertions(2);
    const callback = jest.fn();
    const { container } = render(
      <SuggestedUser id="xx-xx-xx-xx" displayName="ALICE" onClick={callback} />
    );
    const user = container.firstChild;
    if (!user) return;
    expect(user.childNodes[0].textContent).toEqual("ALICE");
    // click "x" icon
    fireEvent.click(user.childNodes[1]);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
