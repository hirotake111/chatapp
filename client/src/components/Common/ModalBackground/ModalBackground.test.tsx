import { render, screen, fireEvent } from "@testing-library/react";
import { ModalBackground } from "./ModalBackground";

describe("ModalBackground", () => {
  let callback: jest.Mock;

  beforeEach(() => {
    callback = jest.fn();
  });

  it("should display modal if enabled", () => {
    expect.assertions(1);
    const { container } = render(
      <ModalBackground id={"id01"} enabled={true} onClick={callback}>
        child component
      </ModalBackground>
    );
    expect(screen.getByText("child component").style.display).toEqual("flex");
  });

  it("should not display modal if disabled", () => {
    expect.assertions(1);
    render(
      <ModalBackground id={"id01"} enabled={false} onClick={callback}>
        child component
      </ModalBackground>
    );
    expect(screen.getByText("child component").style.display).toEqual("none");
  });

  it("should invoke callback", () => {
    expect.assertions(1);
    const { container } = render(
      <ModalBackground id={"id01"} enabled={false} onClick={callback}>
        child component
      </ModalBackground>
    );
    const background = container.firstChild;
    if (background) {
      fireEvent.click(background);
      expect(callback).toHaveBeenCalledTimes(1);
    }
  });
});
