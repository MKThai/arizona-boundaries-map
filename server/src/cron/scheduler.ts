import cron from "node-cron";
import { scrapeArizonaLegislators } from "../services/scraper.service.js";

export function startCronJobs() {
  cron.schedule("0 3 * * *", async () => {
    console.log("[Cron] Running daily Arizona legislator scrape...");
    const result = await scrapeArizonaLegislators();
    console.log(`[Cron] Scrape complete: ${result.status} - ${result.message}`);
  });

  console.log("[Cron] Scheduled: Arizona legislator scrape daily at 3:00 AM");
}
