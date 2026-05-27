/**
 * Admin page — manually trigger the Open States legislator scraper.
 *
 * This is a simpler component than OfficialsList: no tabs, no search, just a button
 * that kicks off a POST request and displays the result.
 *
 * State pattern:
 * - `scraping` — boolean flag to disable the button and show a spinner label
 * - `scrapeResult` — null until a scrape completes, then holds the API response
 */
import { useState } from 'react';
import { triggerScrape } from '../services/officialsApi';
import type { ScrapeResult } from '../types/official';
import './PoliticalSnapshot.scss';

export default function PoliticalSnapshot() {
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);

  /**
   * Event handler for the "Run Scraper Now" button.
   *
   * Async functions can be used directly as click handlers. We don't need
   * `.subscribe()` like Angular/RxJS — just await the Promise.
   */
  async function handleTriggerScrape() {
    setScraping(true);
    setScrapeResult(null);

    try {
      const result = await triggerScrape();
      setScrapeResult(result);
    } catch {
      // Network or server failure — show a generic error result.
      setScrapeResult({
        status: 'error',
        recordCount: 0,
        message: 'Request failed. Is the API server running?',
      });
    } finally {
      setScraping(false);
    }
  }

  return (
    <div className="snapshot-container">
      <h2>📊 Data Management</h2>
      <p className="description">
        Trigger the scraper to fetch the latest Arizona legislator data from Open States.
      </p>

      {/*
        `disabled={scraping}` prevents double-clicks while a request is in progress.
        The button label switches based on state (conditional rendering inside JSX).
      */}
      <button
        type="button"
        className="scrape-btn"
        onClick={() => void handleTriggerScrape()}
        disabled={scraping}
      >
        {scraping ? '⏳ Scraping...' : '🔄 Run Scraper Now'}
      </button>

      {/*
        Only render the result box when `scrapeResult` is not null.
        `&&` short-circuits: if scrapeResult is null, nothing is rendered.
      */}
      {scrapeResult && (
        <div className={`result ${scrapeResult.status === 'success' ? 'success' : 'error'}`}>
          <strong>
            {scrapeResult.status === 'success' ? '✅' : '❌'}{' '}
            {scrapeResult.status.charAt(0).toUpperCase() + scrapeResult.status.slice(1)}
          </strong>
          <p>{scrapeResult.message}</p>
          {scrapeResult.recordCount > 0 && (
            <p className="count">{scrapeResult.recordCount} records processed</p>
          )}
        </div>
      )}
    </div>
  );
}
