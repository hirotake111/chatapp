import { render } from "@testing-library/react";
import { ProfileModal } from "./ProfileModal";

describe("ProfileModal", () => {
  it("should display profile modal when show is true", () => {
    expect.assertions(1);
    const { container } = render(<ProfileModal show={true} />);
    const element = container.getElementsByClassName(
      "profile-modal"
    )[0] as HTMLDivElement;
    expect(element.style.display).toEqual("flex");
  });

  it("should NOT display profile modal when show is false", () => {
    expect.assertions(1);
    const { container } = render(<ProfileModal show={false} />);
    const element = container.getElementsByClassName(
      "profile-modal"
    )[0] as HTMLDivElement;
    expect(element.style.display).toEqual("none");
  });
});
