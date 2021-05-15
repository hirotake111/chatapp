import { Sequelize } from "sequelize-typescript";
import { ConfigType } from "../config";

export const getDb = async (config: ConfigType): Promise<Sequelize> => {
  try {
    // connect to database
    const sequelize = new Sequelize(config.database.databaseUri, {
      models: config.database.modelPath,
      ...config.database.sequelizeoptions,
    });
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
