import { nanoid } from "@reduxjs/toolkit";
import { v4 as uuid } from "uuid";

import { asyncWait } from "./utils";

describe("asyncWait", () => {
  it("should return passed value", async () => {
    expect.assertions(1);
    expect(await asyncWait(1000)).toEqual(true);
  });
});
