import "../models.js";
import { sequelize } from "../db.js";
import { User } from "../models.js";
import bcrypt from "bcryptjs";

export async function run() {
  try {
    await sequelize.authenticate();

    const password = await bcrypt.hash(
      process.env.SUPER_ADMIN_PASSWORD || "root",
      12,
    );

    const [user, created] = await User.findOrCreate({
      where: { email: "root@example.com" },
      defaults: {
        email: "root@example.com",
        login: "root",
        name: "Root",
        roles: ["super_admin"],
        password,
        bar_id: null,
      },
    });

    console.log("super admin:", user.id, created ? "created" : "exists");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  run().catch(() => process.exit(1));
}

export default run;
