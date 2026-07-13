import { useEffect, useState } from 'react';
import {
  getGroupedOfficials,
  getPartyClass,
  getPartyLabel,
  searchOfficials,
  triggerScrape,
} from '../services/officialsApi';
import type { Official, OfficialGroup, ScrapeResult } from '../types/official';
import './OfficialsList.scss';

function OfficialCard({ official }: { official: Official | OfficialGroup['officials'][number] }) {
  return (
    <div className="official-card">
      <div className="official-info">
        <span className="official-name">{official.name}</span>
        <span className={`badge ${getPartyClass(official.party)}`}>
          {getPartyLabel(official.party)}
        </span>
      </div>
      <div className="official-detail">
        {official.title}
        {'jurisdictionName' in official && official.jurisdictionName && (
          <span className="district"> · {official.jurisdictionName}</span>
        )}
        {official.district && <span className="district"> · Dist {official.district}</span>}
      </div>
    </div>
  );
}

export default function OfficialsList() {
  const [groups, setGroups] = useState<OfficialGroup[]>([]);
  const [searchResults, setSearchResults] = useState<Official[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await getGroupedOfficials();
      setGroups(data);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    getGroupedOfficials()
      .then((data) => {
        if (!cancelled) {
          setGroups(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setGroups([]);
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
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    } else if (query.length === 0) {
      setSearchResults(null);
      await loadGroups();
    }
  }

  async function handleTriggerScrape() {
    setScraping(true);
    setScrapeResult(null);

    try {
      const result = await triggerScrape();
      setScrapeResult(result);
      if (result.status === 'success' || result.status === 'partial') {
        setSearchQuery('');
        setSearchResults(null);
        await loadGroups();
      }
    } catch {
      setScrapeResult({
        status: 'error',
        recordCount: 0,
        totalRecords: 0,
        message: 'Request failed. Is the API server running?',
      });
    } finally {
      setScraping(false);
    }
  }

  const totalCount =
    searchResults?.length ??
    groups.reduce((sum, group) => sum + group.officials.length, 0);

  return (
    <div className="officials-container">
      <h1 className="title">🗳️ Arizona Officials</h1>

      <section className="scraper-section">
        <p className="description">
          Sync federal, state executive, state legislature, and mayor data from open sources.
        </p>
        <button
          type="button"
          className="scrape-btn"
          onClick={() => void handleTriggerScrape()}
          disabled={scraping}
        >
          {scraping ? '⏳ Syncing...' : '🔄 Sync All Sources'}
        </button>
        {scrapeResult && (
          <div
            className={`result ${
              scrapeResult.status === 'success' || scrapeResult.status === 'partial'
                ? 'success'
                : 'error'
            }`}
          >
            <strong>
              {scrapeResult.status === 'error' ? '❌' : '✅'}{' '}
              {scrapeResult.status.charAt(0).toUpperCase() + scrapeResult.status.slice(1)}
            </strong>
            <p>{scrapeResult.message}</p>
            {scrapeResult.recordCount > 0 && (
              <p className="count">{scrapeResult.recordCount} records processed</p>
            )}
            {scrapeResult.sources && scrapeResult.sources.length > 0 && (
              <ul className="source-results">
                {scrapeResult.sources.map((source) => (
                  <li key={source.source}>
                    {source.status === 'success' ? '✓' : '✗'} {source.source}:{' '}
                    {source.recordCount} — {source.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <input
        type="text"
        className="search-input"
        placeholder="Search name, title, party, or city..."
        value={searchQuery}
        onChange={(event) => void handleSearch(event.target.value)}
      />

      {loading && <div className="loading">Loading...</div>}

      {!loading && totalCount === 0 ? (
        <div className="empty">No officials in the database. Run sync to populate data.</div>
      ) : searchResults ? (
        <section className="officials-column search-results">
          <h2 className="column-title">
            Search Results
            <span className="column-count">{searchResults.length}</span>
          </h2>
          <div className="officials-list">
            {searchResults.map((official) => (
              <OfficialCard key={official.id} official={official} />
            ))}
          </div>
        </section>
      ) : (
        <div className="officials-columns">
          {groups.map((group) => (
            <section key={group.key} className="officials-column">
              <h2 className="column-title">
                {group.label}
                <span className="column-count">{group.officials.length}</span>
              </h2>
              <div className="officials-list">
                {group.officials.map((official) => (
                  <OfficialCard key={official.id} official={official} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
