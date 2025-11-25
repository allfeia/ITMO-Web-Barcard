import { sequelize } from "../db.js";
import "../models.js";

export async function run() {
  try {
    await sequelize.sync({ alter: true });
    console.log("DB synced");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run();
}

export default run;