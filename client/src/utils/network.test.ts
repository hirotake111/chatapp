import { asyncWait, getData, postData } from "./network";

// mock fetch API
global.fetch = (url: any, options: any) =>
  Promise.resolve({
    json: () => {
      return new Promise((resolve, reject) =>
        url ? resolve({ detail: "success" }) : reject("network error")
      );
    },
    status: url === "server" ? 200 : url === "redirect" ? 401 : 400,
  }) as any;

// mock window.location.replace method
window = Object.create(window);
Object.defineProperty(window, "location", {
  value: { replace: jest.fn() },
});

describe("asyncWait", () => {
  it("should return passed value", async () => {
    expect.assertions(1);
    expect(await asyncWait(1000)).toEqual(true);
  });
});

describe("getData", () => {
  it("should return body", async () => {
    expect.assertions(1);
    expect(await getData("server", 10)).toEqual({ detail: "success" });
  });

  it("should throw an error", async () => {
    expect.assertions(1);
    try {
      await getData("badserver", 10);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual("Network error - status code: 400");
    }
  });

  it("should redirect user", async () => {
    expect.assertions(1);
    try {
      await getData("redirect", 10);
      expect(window.location.replace).toHaveBeenCalledTimes(1);
    } catch (e) {
      console.error(e);
    }
  });
});

describe("postData", () => {
  it("should return body", async () => {
    expect.assertions(1);
    expect(await postData("server", { method: "POST" }, 10)).toEqual({
      detail: "success",
    });
  });

  it("should throw an error", async () => {
    expect.assertions(1);
    try {
      await postData("badserver", {}, 10);
    } catch (e) {
      if (e instanceof Error)
        expect(e.message).toEqual("Network error - status code: 400");
    }
  });

  it("should redirect user", async () => {
    expect.assertions(2);
    try {
      expect(await getData("redirect", 10)).toEqual({ detail: "success" });
      expect(window.location.replace).toHaveBeenCalledTimes(1);
    } catch (e) {
      console.error(e);
    }
  });
});
