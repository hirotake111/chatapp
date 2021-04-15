import { v4 as uuid } from "uuid";
import { Sequelize } from "sequelize-typescript";

import { User } from "./User.model";
import { nanoid } from "nanoid";
import { DATABASE_URI, sequelizeOptions } from "../config";
import { Op, QueryTypes } from "sequelize";

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
const storeUserToDB = async (db: Sequelize): Promise<userObject> => {
  try {
    const user = getUser();
    const { id, username, displayName, firstName, lastName } = user;
    await db.query(
      'INSERT INTO "Users" ("id", "username", "displayName", "firstName", "lastName") VALUES (?,?,?,?,?);',
      {
        replacements: [id, username, displayName, firstName, lastName],
      }
    );
    return user;
  } catch (e) {
    throw e;
  }
};

/** helper function to fetch user record from database */
const fetchUserFromDB = async (
  userId: string,
  db: Sequelize
): Promise<User[] | null> => {
  try {
    const result = await db.query<User>(
      'SELECT * FROM "Users" WHERE ("id" = ? and "deletedAt" IS NULL);',
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

/** sequelize object */
const sequelize = new Sequelize(DATABASE_URI, {
  models: [User],
  logging: false, // if needed, uncomment this
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
    try {
      await sequelize.close();
    } catch (e) {
      throw e;
    }
  });

  it("should find user", async () => {
    expect.assertions(2);
    try {
      // create users
      const user = await storeUserToDB(sequelize);
      await storeUserToDB(sequelize);
      // fetch user
      const result = await User.findOne({ where: { id: user.id } });
      // validation
      expect(result?.id).toEqual(user.id);
      expect((await User.findAll())!.length).toEqual(2);
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
    expect.assertions(3);
    try {
      const updatedValue = nanoid();
      // create users
      const user = await storeUserToDB(sequelize);
      const other = await storeUserToDB(sequelize);
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
      // fetch the record for other user
      const result2 = await fetchUserFromDB(other.id, sequelize);
      if (result2) {
        expect(result2[0].firstName).toEqual(other.firstName);
      }
    } catch (e) {
      throw e;
    }
  });

  it("should delete a user", async () => {
    expect.assertions(2);
    try {
      // create users
      const user = await storeUserToDB(sequelize);
      await storeUserToDB(sequelize);
      // delete one
      const num = await User.destroy({ where: { id: user.id } });
      // fetch the record
      const result = await fetchUserFromDB(user.id, sequelize);
      // validation
      if (result) {
        expect(result).toEqual([]);
        expect(num).toEqual(1);
      }
    } catch (e) {
      throw e;
    }
  });
});
