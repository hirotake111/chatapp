import { render } from "@testing-library/react";
import { ChannelSearchBar } from "./ChannelSearchBar";

describe("ChannelSearchBar", () => {
  it("should render search bar", () => {
    expect.assertions(1);
    const { container } = render(<ChannelSearchBar />);
    expect(container.getElementsByTagName("input").length).toEqual(1);
  });
});
