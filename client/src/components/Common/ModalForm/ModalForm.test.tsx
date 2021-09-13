import { render } from "@testing-library/react";
import { ModalForm } from "./ModalForm";

describe("ModalForm", () => {
  it("should render title, subtitle, and children", () => {
    expect.assertions(3);
    const { container } = render(
      <ModalForm title="title1" subtitle="subtitle1">
        <span>child component</span>
      </ModalForm>
    );
    const form = container.firstChild as HTMLDivElement;
    if (form) {
      const children = Array.from(form.childNodes);
      expect(children[0].textContent).toEqual("title1");
      expect(children[1].textContent).toEqual("subtitle1");
      expect(children[2].textContent).toEqual("child component");
    }
  });
});
