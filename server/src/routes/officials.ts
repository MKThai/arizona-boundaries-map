import { Router } from "express";
import {
  getAllOfficials,
  getOfficialsByBranch,
  getOfficialsByChamber,
  searchOfficials,
} from "../services/officials.service.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const officials = await getAllOfficials();
    res.json(officials);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch officials" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const query = (req.query.q as string) || "";
    const officials = await searchOfficials(query);
    res.json(officials);
  } catch (_error) {
    res.status(500).json({ error: "Search failed" });
  }
});

router.get("/branch/:branch", async (req, res) => {
  try {
    const officials = await getOfficialsByBranch(req.params.branch);
    res.json(officials);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch officials by branch" });
  }
});

router.get("/chamber/:chamber", async (req, res) => {
  try {
    const officials = await getOfficialsByChamber(req.params.chamber);
    res.json(officials);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch officials by chamber" });
  }
});

export default router;
