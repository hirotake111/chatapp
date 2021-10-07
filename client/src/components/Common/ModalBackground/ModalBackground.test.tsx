import { render, screen, fireEvent } from "@testing-library/react";
import { ModalBackground } from "./ModalBackground";

describe("ModalBackground", () => {
  let mockCallback: jest.Mock;

  beforeEach(() => {
    mockCallback = jest.fn();
  });

  it("should display modal if enabled", () => {
    expect.assertions(1);
    render(
      <ModalBackground id={"id01"} enabled={true} onClick={mockCallback}>
        child component
      </ModalBackground>
    );
    expect(screen.getByText("child component").style.display).toEqual("flex");
  });

  it("should not display modal if disabled", () => {
    expect.assertions(1);
    render(
      <ModalBackground id={"id01"} enabled={false} onClick={mockCallback}>
        child component
      </ModalBackground>
    );
    expect(screen.getByText("child component").style.display).toEqual("none");
  });

  it("should invoke callback", () => {
    expect.assertions(1);
    const { container } = render(
      <ModalBackground id={"id01"} enabled={false} onClick={mockCallback}>
        child component
      </ModalBackground>
    );
    const background = container.firstChild;
    if (background) {
      fireEvent.click(background);
      expect(mockCallback).toHaveBeenCalledTimes(1);
    }
  });
});
