import { v4 as uuid } from "uuid";
import { Sequelize } from "sequelize-typescript";

import { User } from "./User.model";
import { nanoid } from "nanoid";
import { DATABASE_URI, sequelizeOptions } from "../config";

let sequelize: Sequelize;

describe("User model", () => {
  beforeEach(async () => {
    try {
      sequelize = new Sequelize(DATABASE_URI, {
        models: [User],
        ...sequelizeOptions,
      });
      await sequelize.authenticate();
    } catch (e) {
      throw e;
    }
  });

  afterEach(async () => {
    try {
      await sequelize.close();
    } catch (e) {
      throw e;
    }
  });

  it("should find user", async () => {
    expect.assertions(1);
    // try {
    //   const user = {
    //     id: uuid(),
    //     username: nanoid(),
    //     displayName: nanoid(),
    //     firstName: nanoid(),
    //     lastname: nanoid(),
    //   };
    //   // create a user
    //   await sequelize.query(
    //     'INSERT INTO "Users" (id, username, displayName, firstName, lastName) VALUES (?,?,?,?,?)',
    //     {
    //       replacements: [
    //         user.id,
    //         user.username,
    //         user.displayName,
    //         user.firstName,
    //         user.lastname,
    //       ],
    //     }
    //   );
    //   const result = await User.findOne({ where: { id: user.id } });
    //   expect(result?.id).toEqual(user.id);
    // } catch (e) {
    //   throw e;
    // }
  });
});
