import { nanoid } from "nanoid";
import { Sequelize } from "sequelize-typescript";
import { getDb } from "./dbFactory";

jest.mock("sequelize-typescript");

const connectionUri = `postgres://${nanoid()}`;
const models = {} as any;
const options = {} as any;

describe("getDb()", () => {
  it("should return sequelize object", async () => {
    expect.assertions(2);
    try {
      const db = await getDb(connectionUri, models, options);
      expect(db).toBeTruthy();
      expect(Sequelize).toHaveBeenCalledTimes(1);
    } catch (e) {
      throw e;
    }
  });

  it("should raise an error", async () => {
    expect.assertions(1);
    const msg = "unable to create database";
    try {
      // mock only authenticate() method
      jest.spyOn(Sequelize.prototype, "authenticate").mockImplementation(() => {
        throw new Error(msg);
      });
      await getDb(connectionUri, models, options);
    } catch (e) {
      expect(e.message).toEqual(msg);
    }
  });
});
