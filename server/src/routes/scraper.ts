import { Router } from "express";
import {
  getScrapeHistory,
  listDataSources,
  scrapeStateOfficials,
} from "../services/scraper.service.js";

const router = Router();

router.post("/trigger", async (req, res) => {
  try {
    const state = typeof req.body?.state === "string" ? req.body.state : "AZ";
    console.log(`[Scraper] Manual trigger via REST for ${state.toUpperCase()}`);
    const result = await scrapeStateOfficials(state);
    res.json(result);
  } catch (_error) {
    res.status(500).json({ error: "Scrape failed" });
  }
});

router.get("/sources", async (_req, res) => {
  try {
    const sources = await listDataSources();
    res.json(sources);
  } catch (_error) {
    res.status(500).json({ error: "Failed to list data sources" });
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
