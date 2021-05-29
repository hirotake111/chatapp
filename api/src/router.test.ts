import { Router } from "express";
import { RootController } from "./controllers/controller";
import { useRoute } from "./router";

describe("router", () => {
  it("should return Router object", () => {
    const controller = {
      getRoot: jest.fn(),
      getUserinfo: jest.fn(),
      user: {
        getLogin: jest.fn(),
        getCallback: jest.fn(),
      },
    } as RootController;
    const router = useRoute(controller);
    expect(router).toBeInstanceOf(Function);
  });
});
