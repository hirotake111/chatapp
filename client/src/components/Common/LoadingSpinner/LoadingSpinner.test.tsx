import { render } from "@testing-library/react";
import { LoadingSpinner } from "./LoadingSpinner";

describe("LoadingSpinner", () => {
  let callback: jest.Mock; // callback function to be called

  beforeEach(() => {
    // use fake timers
    jest.useFakeTimers();
    callback = jest.fn();
  });

  afterEach(() => {
    // run pending timers and replace it with real one
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("should invoke callback if enabled", async () => {
    expect.assertions(1);
    render(<LoadingSpinner enabled={true} callback={callback} ms={10} />);
    // run all timers
    jest.runAllTimers();
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("should not invoke callback if disabled", async () => {
    expect.assertions(1);
    render(<LoadingSpinner enabled={false} callback={callback} ms={10} />);
    // run all timers
    jest.runAllTimers();
    expect(callback).toHaveBeenCalledTimes(0);
  });

  it("should call console.error if callback failed", async () => {
    expect.assertions(1);
    const err = new Error("signin error!");
    console.error = jest.fn();
    callback = jest.fn().mockImplementation(() => {
      throw err;
    });
    render(<LoadingSpinner enabled={true} callback={callback} ms={10} />);
    // run all timers
    jest.runAllTimers();
    expect(console.error).toHaveBeenCalledWith(err);
  });
});
