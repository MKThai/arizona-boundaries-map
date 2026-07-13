import cron from "node-cron";
import { scrapeStateOfficials } from "../services/scraper.service.js";

export function startCronJobs() {
  cron.schedule("0 3 * * *", async () => {
    console.log("[Cron] Running daily Arizona officials scrape...");
    const result = await scrapeStateOfficials("AZ");
    console.log(`[Cron] Scrape complete: ${result.status} - ${result.message}`);
  });

  console.log("[Cron] Scheduled: Arizona officials scrape daily at 3:00 AM");
}
