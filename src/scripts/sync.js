import { sequelize } from '../db.js';
import '../models.js';

(async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('DB synced');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();