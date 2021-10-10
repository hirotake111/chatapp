import { nanoid } from "nanoid";
import { Sequelize } from "sequelize-typescript";
import { getDb } from "./db";

jest.mock("sequelize-typescript");

const config = {
  database: {
    databaseUri: `postgres://${nanoid()}`,
    sequelizeoptions: {},
    modelPath: ["postgres://localhost:5432"],
  },
} as any;

describe("getDb()", () => {
  it("should return sequelize object", async () => {
    expect.assertions(2);
    try {
      const db = await getDb(
        config.database.databaseUri,
        config.database.modelPath,
        config.database.sequelizeoptions
      );
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
      await getDb(
        config.database.databaseUri,
        config.database.modelPath,
        config.database.sequelizeoptions
      );
    } catch (e) {
      if (e instanceof Error) expect(e.message).toEqual(msg);
    }
  });
});
