import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";

import { sequelize } from "./db.js";
import "./models.js";

import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";

Sentry.init({
    dsn: "https://4d49d2f7f9efb43e46b35dbe8cb28664@o4510535321255936.ingest.us.sentry.io/4510535581237248",
    integrations: [
        Sentry.httpIntegration(),
        Sentry.expressIntegration(),
    ],
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV || "development",
});

const app = express();
app.use(cookieParser());

app.use(helmet());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(",") || "*",
        credentials: false,
    }),
);
app.use(express.json({ limit: "1mb" }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/auth/", authLimiter);

app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

app.use("/api", authRoutes);
app.use("/api", apiRoutes);

const port = process.env.PORT || 4000;
(async () => {
    try {
        await sequelize.authenticate();
        console.log("DB connected");
        app.listen(port, () => console.log(`API on http://localhost:${port}`));
    } catch (e) {
        console.error("DB error", e);
        Sentry.captureException(e);
        process.exit(1);
    }
})();