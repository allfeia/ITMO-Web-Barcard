import { Sequelize } from "sequelize";
import "dotenv/config";

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
      ...((process.env.DATABASE_URL || "").includes("sslmode=require")
          ? { ssl: { require: true, rejectUnauthorized: false } }
          : {}),
      keepAlive: true,
  },
});
