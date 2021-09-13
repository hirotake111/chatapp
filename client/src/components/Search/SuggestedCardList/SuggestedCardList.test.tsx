import { render } from "@testing-library/react";
import { SuggestedCardList } from "./SuggestedCardList";

describe("SuggestedCardList", () => {
  let callback: jest.Mock;

  const getContainer = (status: UserSearchStatus) => {
    const { container } = render(
      <SuggestedCardList status={status} onCardClick={callback} />
    );
    return container;
  };

  beforeEach(() => {
    callback = jest.fn();
  });

  it("should render SuggestedCard when searching", () => {
    expect.assertions(1);
    const container = getContainer({ type: "searching" });
    const cardContainer = container.firstChild;
    if (!cardContainer) return;
    expect(cardContainer.firstChild?.textContent).toEqual("searching...");
  });

  it("should render SuggestedCard when user found", () => {
    expect.assertions(1);
    const container = getContainer({
      type: "userFound",
      users: [{ id: "1", displayName: "ALICE", username: "alice" }],
    });
    const cardContainer = container.firstChild;
    if (!cardContainer) return;
    expect(cardContainer.firstChild?.textContent).toEqual("ALICE (alice)");
  });

  it("should render SuggestedCard when user not found", () => {
    expect.assertions(1);
    const container = getContainer({
      type: "noUserFound",
    });
    const cardContainer = container.firstChild;
    if (!cardContainer) return;
    expect(cardContainer.firstChild?.textContent).toEqual(
      "We didn't find any matches."
    );
  });

  it("shouold render nothing when not initiated or other state", () => {
    expect.assertions(3);
    let container = getContainer({ type: "notInitiated" });
    let cardContainer = container.firstChild;
    if (!cardContainer) return;
    expect(cardContainer.firstChild).toBeNull();
    container = getContainer({ type: "hidden" });
    cardContainer = container.firstChild;
    if (!cardContainer) return;
    expect(cardContainer.firstChild).toBeNull();
    container = getContainer({ type: "searchDone" });
    cardContainer = container.firstChild;
    if (!cardContainer) return;
    expect(cardContainer.firstChild).toBeNull();
  });
});
