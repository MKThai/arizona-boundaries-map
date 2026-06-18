import { useEffect, useState } from 'react';
import {
  getAllOfficials,
  getPartyClass,
  getPartyLabel,
  searchOfficials,
  triggerScrape,
} from '../services/officialsApi';
import type { Official, ScrapeResult } from '../types/official';
import './OfficialsList.scss';

export default function OfficialsList() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);

  const loadOfficials = async () => {
    setLoading(true);
    try {
      const data = await getAllOfficials();
      setOfficials(data);
    } catch {
      setOfficials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    getAllOfficials()
      .then((data) => {
        if (!cancelled) {
          setOfficials(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOfficials([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSearch(query: string) {
    setSearchQuery(query);

    if (query.length > 1) {
      setLoading(true);
      try {
        const data = await searchOfficials(query);
        setOfficials(data);
      } catch {
        setOfficials([]);
      } finally {
        setLoading(false);
      }
    } else if (query.length === 0) {
      await loadOfficials();
    }
  }

  async function handleTriggerScrape() {
    setScraping(true);
    setScrapeResult(null);

    try {
      const result = await triggerScrape();
      setScrapeResult(result);
      if (result.status === 'success') {
        setSearchQuery('');
        await loadOfficials();
      }
    } catch {
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
    <div className="officials-container">
      <h1 className="title">🗳️ Arizona Officials</h1>

      <section className="scraper-section">
        <p className="description">
          Fetch the latest legislator data from Open States and save it to the database.
        </p>
        <button
          type="button"
          className="scrape-btn"
          onClick={() => void handleTriggerScrape()}
          disabled={scraping}
        >
          {scraping ? '⏳ Scraping...' : '🔄 Run Scraper Now'}
        </button>
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
      </section>

      <input
        type="text"
        className="search-input"
        placeholder="Search name, title, or party..."
        value={searchQuery}
        onChange={(event) => void handleSearch(event.target.value)}
      />

      {loading && <div className="loading">Loading...</div>}

      <div className="officials-list">
        {officials.map((official) => (
          <div key={official.id} className="official-card">
            <div className="official-info">
              <span className="official-name">{official.name}</span>
              <span className={`badge ${getPartyClass(official.party)}`}>
                {getPartyLabel(official.party)}
              </span>
            </div>
            <div className="official-detail">
              {official.title}
              {official.district && (
                <span className="district"> · Dist {official.district}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && officials.length === 0 && (
        <div className="empty">No officials in the database. Run the scraper to populate data.</div>
      )}
    </div>
  );
}
