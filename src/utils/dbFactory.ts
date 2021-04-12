import {
  Model,
  ModelCtor,
  Sequelize,
  SequelizeOptions,
} from "sequelize-typescript";

export const getDb = async (
  connectionUri: string,
  models: ModelCtor<Model<any, any>>[],
  options?: SequelizeOptions
): Promise<Sequelize> => {
  try {
    // connect to database
    const sequelize = new Sequelize(connectionUri, { models, ...options });
    // check connectivity
    await sequelize.authenticate();
    console.log("connected to database.", connectionUri);
    // create database if not exists
    await sequelize.sync();
    return sequelize;
  } catch (e) {
    throw e;
  }
};
