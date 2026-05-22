import { Router } from "express";
import {
  scrapeArizonaLegislators,
  getScrapeHistory,
} from "../services/scraper.service.js";

const router = Router();

router.post("/trigger", async (_req, res) => {
  try {
    console.log("[Scraper] Manual trigger via REST");
    const result = await scrapeArizonaLegislators();
    res.json(result);
  } catch (_error) {
    res.status(500).json({ error: "Scrape failed" });
  }
});

router.get("/history", async (_req, res) => {
  try {
    const history = await getScrapeHistory();
    res.json(history);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;
