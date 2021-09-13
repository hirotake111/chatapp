import { render, fireEvent } from "@testing-library/react";
import { CandidateList } from "./CandidateList";

describe("CandidateList", () => {
  let candidates: SearchedUser[];
  let callback: jest.Mock;

  beforeEach(() => {
    candidates = [
      { id: "xx-xx-xx-xx", username: "alice", displayName: "ALICE" },
      { id: "yy-yy-yy-yy", username: "bob", displayName: "BOB" },
    ];
    callback = jest.fn();
  });

  it("should render candidate list", () => {
    expect.assertions(4);
    const { container } = render(
      <CandidateList candidates={candidates} onClick={callback} />
    );
    const ul = container.firstChild as HTMLDivElement;
    if (!ul) return;
    const lists = Array.from(ul.childNodes);
    expect(lists.length).toBe(2);
    expect(lists[0].childNodes[0].textContent).toEqual("ALICE");
    expect(lists[1].childNodes[0].textContent).toEqual("BOB");
    // click "x" button
    fireEvent.click(lists[0].childNodes[1]);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
