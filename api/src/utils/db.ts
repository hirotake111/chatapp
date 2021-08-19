import { ModelCtor, Sequelize, SequelizeOptions } from "sequelize-typescript";

export const getDb = async (
  uri: string,
  models: ModelCtor[],
  options: SequelizeOptions
): Promise<Sequelize> => {
  try {
    // connect to database
    const sequelize = new Sequelize(uri, { ...options, models });
    // check connectivity
    await sequelize.authenticate();
    // console.log("connected to database.", connectionUri);
    // create database if not exists
    await sequelize.sync();
    return sequelize;
  } catch (e) {
    throw e;
  }
};
