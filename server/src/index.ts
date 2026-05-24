import express from "express";
import cors from "cors";
import officialsRouter from "./routes/officials.js";
import scraperRouter from "./routes/scraper.js";
import { startCronJobs } from "./cron/scheduler.js";

const app = express();
const PORT = process.env.PORT || 3000;

const corsOrigins =
  process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ??
  ["http://localhost:4200"];

app.use(
  cors({
    origin: corsOrigins,
  }),
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "arizona-boundaries-api", timestamp: new Date().toISOString() });
});

app.use("/api/officials", officialsRouter);
app.use("/api/scraper", scraperRouter);

app.listen(PORT, () => {
  console.log(`[Server] Arizona Boundaries API running on http://localhost:${PORT}`);
  startCronJobs();
});
