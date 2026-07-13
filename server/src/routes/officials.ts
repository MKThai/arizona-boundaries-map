import { Router } from "express";
import {
  getAllOfficials,
  getGroupedOfficials,
  getOfficialsByChamber,
  getOfficialsByGovBranch,
  parseOfficialFilters,
  searchOfficials,
} from "../services/officials.service.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const filters = parseOfficialFilters(req.query);
    const officials = await getAllOfficials(filters);
    res.json(officials);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch officials" });
  }
});

router.get("/grouped", async (req, res) => {
  try {
    const filters = parseOfficialFilters(req.query);
    const groups = await getGroupedOfficials(filters);
    res.json(groups);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch grouped officials" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const query = (req.query.q as string) || "";
    const filters = parseOfficialFilters(req.query);
    const officials = await searchOfficials(query, filters);
    res.json(officials);
  } catch (_error) {
    res.status(500).json({ error: "Search failed" });
  }
});

router.get("/branch/:branch", async (req, res) => {
  try {
    const filters = parseOfficialFilters(req.query);
    const officials = await getOfficialsByGovBranch(req.params.branch, filters);
    res.json(officials);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch officials by branch" });
  }
});

router.get("/chamber/:chamber", async (req, res) => {
  try {
    const filters = parseOfficialFilters(req.query);
    const officials = await getOfficialsByChamber(req.params.chamber, filters);
    res.json(officials);
  } catch (_error) {
    res.status(500).json({ error: "Failed to fetch officials by chamber" });
  }
});

export default router;
