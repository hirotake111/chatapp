import { useAppDispatch, useAppSelector } from "./reduxHooks";

// mock useDispatch and useSelector
jest.mock("react-redux", () => ({
  useDispatch: () => 1,
  useSelector: () => 2,
}));

describe("useAppDispatch", () => {
  it("should return return value of useDispatch", () => {
    expect.assertions(1);
    expect(useAppDispatch()).toEqual(1);
  });
});

describe("useAppSelector", () => {
  it("should return useSelector", () => {
    expect.assertions(1);
    expect(useAppSelector({} as any)).toEqual(2);
  });
});
