import { Sequelize } from "sequelize";
import "dotenv/config";

const isTest = process.env.NODE_ENV === "test";

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: (process.env.DATABASE_URL || "").includes("sslmode=require")
    ? {
      ssl: { require: true, rejectUnauthorized: false },
      ...(isTest ? {} : { keepAlive: true }),

      }
    : {},
});
