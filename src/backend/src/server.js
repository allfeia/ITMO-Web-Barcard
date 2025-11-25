import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import { sequelize } from './db.js';
import './models.js';

import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: false }));
app.use(express.json({ limit: '1mb' }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/auth/', authLimiter);

app.use('/api', authRoutes);
app.use('/api', apiRoutes);

const port = process.env.PORT || 4000;
(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    app.listen(port, () => console.log(`API on http://localhost:${port}`));
  } catch (e) {
    console.error('DB error', e);
    process.exit(1);
  }
})();