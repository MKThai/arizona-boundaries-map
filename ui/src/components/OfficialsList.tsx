/**
 * Officials list page — browse Arizona officials by branch/chamber or search.
 *
 * Key React concepts used here:
 * - `useState` — local component state (replaces Angular signals like `signal()`)
 * - `useEffect` — run side effects when state/props change (replaces `ngOnInit` + subscriptions)
 * - Conditional rendering with `&&` and ternary expressions (replaces `@if` in Angular templates)
 * - `.map()` to render lists (replaces `@for` in Angular templates)
 */
import { useEffect, useState } from 'react';
import {
  getOfficialsByBranch,
  getOfficialsByChamber,
  getPartyClass,
  getPartyLabel,
  searchOfficials,
} from '../services/officialsApi';
import type { Official, OfficialsTab } from '../types/official';
import './OfficialsList.scss';

/** Pick the API call for a given tab. Pure helper — no React hooks inside. */
function fetchOfficialsForTab(tab: OfficialsTab): Promise<Official[]> {
  return tab === 'executive' ? getOfficialsByBranch('executive') : getOfficialsByChamber(tab);
}

export default function OfficialsList() {
  // --- State ---
  // Each `useState` call returns [currentValue, setterFunction].
  // When you call the setter, React re-renders this component with the new value.

  /** Officials currently displayed in the list. */
  const [officials, setOfficials] = useState<Official[]>([]);

  /** Text in the search box. */
  const [searchQuery, setSearchQuery] = useState('');

  /** True while an API request is in flight — starts true for the initial page load. */
  const [loading, setLoading] = useState(true);

  /** Which tab is selected: Executive, Senate, or House. */
  const [activeTab, setActiveTab] = useState<OfficialsTab>('executive');

  /**
   * Reload tab data whenever the active tab changes (including on first mount).
   *
   * Important pattern: we do NOT call `setState` synchronously inside this effect.
   * State updates happen in the Promise `.then()` callback — after the network responds.
   * That keeps React's linter happy and avoids extra render passes.
   *
   * The `cancelled` flag handles race conditions: if the user switches tabs quickly,
   * we ignore stale responses from the previous tab's request.
   */
  useEffect(() => {
    let cancelled = false;

    fetchOfficialsForTab(activeTab)
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

    // Cleanup runs when `activeTab` changes or the component unmounts.
    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  /** Switch tabs and reset search so tab data loads fresh. */
  function switchTab(tab: OfficialsTab) {
    setLoading(true);
    setActiveTab(tab);
    setSearchQuery('');
  }

  /** Handle search input — fires on every keystroke (same as Angular's `(input)`). */
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
      // Cleared the search box — reload the current tab's data.
      setLoading(true);
      try {
        const data = await fetchOfficialsForTab(activeTab);
        setOfficials(data);
      } catch {
        setOfficials([]);
      } finally {
        setLoading(false);
      }
    }
    // If query length is exactly 1, do nothing (same behavior as the Angular app).
  }

  return (
    <div className="officials-container">
      <h1 className="title">🗳️ Arizona Officials</h1>

      {/*
        Controlled input: React owns the value via `searchQuery` state.
        `onChange` updates state on every keystroke, which re-renders with the new value.
        Angular used `[ngModel]` + `(ngModelChange)` for the same pattern.
      */}
      <input
        type="text"
        className="search-input"
        placeholder="Search name, title, or party..."
        value={searchQuery}
        onChange={(event) => void handleSearch(event.target.value)}
      />

      <div className="tabs">
        {(['executive', 'senate', 'house'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'active' : undefined}
            onClick={() => switchTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Conditional rendering: show loading message only while fetching. */}
      {loading && <div className="loading">Loading...</div>}

      <div className="officials-list">
        {/*
          `.map()` transforms the officials array into an array of JSX elements.
          `key={official.id}` helps React efficiently update the list when data changes.
        */}
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

      {/* Show empty state only when not loading and the list is empty. */}
      {!loading && officials.length === 0 && (
        <div className="empty">No officials found.</div>
      )}
    </div>
  );
}
