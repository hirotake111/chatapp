import { v4 as uuid } from "uuid";
import { Sequelize } from "sequelize-typescript";

import { User } from "./User.model";
import { nanoid } from "nanoid";
import { DATABASE_URI, sequelizeOptions } from "../config";
import { QueryTypes } from "sequelize";

interface userObject {
  id: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
}

/** helper function to create a user object*/
const getUser = (): userObject => ({
  id: uuid(),
  username: nanoid(),
  displayName: nanoid(),
  firstName: nanoid(),
  lastName: nanoid(),
});

/** helper function to store a new user to database */
const createUser = async (user: userObject, db: Sequelize): Promise<void> => {
  try {
    await db.query(
      'INSERT INTO "Users" ("id", "username", "displayName", "firstName", "lastName") VALUES (?,?,?,?,?);',
      {
        replacements: [
          user.id,
          user.username,
          user.displayName,
          user.firstName,
          user.lastName,
        ],
      }
    );
  } catch (e) {
    throw e;
  }
};

/** fetch user record from database */
const fetchUserFromDB = async (
  userId: string,
  db: Sequelize
): Promise<User[] | null> => {
  try {
    const result = await db.query<User>(
      'SELECT * FROM "Users" WHERE ("id" = ?);',
      {
        replacements: [userId],
        type: QueryTypes.SELECT,
      }
    );
    return result ? result : null;
  } catch (e) {
    throw e;
  }
};
const sequelize = new Sequelize(DATABASE_URI, {
  models: [User],
  ...sequelizeOptions,
});

describe("User model", () => {
  beforeAll(async () => {
    try {
      await sequelize.authenticate();
      await sequelize.sync();
    } catch (e) {
      throw e;
    }
  });

  afterEach(async () => {
    try {
      await sequelize.query('DELETE FROM "Users"');
      // await sequelize.close();
    } catch (e) {
      throw e;
    }
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it("should find user", async () => {
    expect.assertions(1);
    try {
      const user = getUser();
      // create a user
      await createUser(user, sequelize);
      // fetch user
      const result = await User.findOne({ where: { id: user.id } });
      // validation
      expect(result?.id).toEqual(user.id);
    } catch (e) {
      throw e;
    }
  });

  it("should create a user", async () => {
    expect.assertions(2);
    try {
      // get user object
      const user = getUser();
      // create a new record
      const created = await User.create({ ...user });
      // fetch the record
      const result = await fetchUserFromDB(user.id, sequelize);
      // validation
      if (result) {
        expect(result[0].id).toEqual(user.id);
        expect(created.getDataValue("id")).toEqual(user.id);
      }
    } catch (e) {
      throw e;
    }
  });

  it("should update a user", async () => {
    expect.assertions(2);
    try {
      const updatedValue = nanoid();
      // create a new user object
      const user = getUser();
      // add it to database
      await createUser(user, sequelize);
      // update it
      const [num, _] = await User.update(
        { firstName: updatedValue },
        { where: { id: user.id } }
      );
      // fetch the record
      const result = await fetchUserFromDB(user.id, sequelize);
      // validation
      if (result) {
        expect(result[0].firstName).toEqual(updatedValue);
        expect(num).toEqual(1);
      }
    } catch (e) {
      throw e;
    }
  });
});
