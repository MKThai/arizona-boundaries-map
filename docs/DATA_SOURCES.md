# Data Sources — Officials Pipeline

Phase 1 catalog of open data sources used to populate elected and appointed officials. Each source has a dedicated adapter under `server/src/adapters/` that transforms raw data into the canonical schema in `server/src/types/canonical-official.ts`.

## Canonical schema

Every adapter produces `CanonicalOfficial` records with:

| Field | Description |
|-------|-------------|
| `externalId` | Stable ID from source (`ocd-person/...`, `bioguide:...`) |
| `level` | `federal` \| `state` \| `county` \| `municipal` |
| `govBranch` | `executive` \| `legislative` \| `judicial` |
| `roleType` | Machine role: `senator`, `governor`, `mayor`, etc. |
| `jurisdictionOcd` | Open Civic Data jurisdiction identifier |
| `source` | Adapter source key used for upsert/replace |

Cross-source linking uses **OCD-IDs** ([Open Civic Data](https://opencivicdata.org/en/latest/data/opencivicdataids.html)).

---

## Tier A — Active adapters

### 1. `congress` — unitedstates/congress-legislators

| | |
|---|---|
| **Coverage** | Current U.S. Senators and Representatives for the requested state |
| **URL** | `https://raw.githubusercontent.com/unitedstates/congress-legislators/main/legislators-current.yaml` |
| **License** | Public domain / CC0 |
| **API key** | None |
| **Adapter** | `congress-legislators.adapter.ts` |

**Source schema (abbreviated):**

```yaml
id:
  bioguide: S000033
name:
  first: Kyrsten
  last: Sinema
  official_full: Kyrsten Sinema
terms:
  - type: sen | rep
    state: AZ
    district: 9          # House only
    party: Democrat
    start: "2025-01-03"
    end: "2027-01-03"
    url: https://...
    phone: 202-...
```

**Maps to:** `level=federal`, `govBranch=legislative`, `chamber=senate|house`

---

### 2. `openstates_legislators` — Open States nightly CSV

| | |
|---|---|
| **Coverage** | Current state legislators (upper + lower chamber) |
| **URL** | `https://data.openstates.org/people/current/{st}.csv` |
| **License** | Open / community-maintained |
| **API key** | None |
| **Adapter** | `openstates-csv.adapter.ts` |

**Source columns:** `id`, `name`, `current_party`, `current_chamber` (`upper`\|`lower`), `current_district`, `image`, contact columns, social links.

Full schema: [openstates/people schema.md](https://github.com/openstates/people/blob/master/schema.md)

**Maps to:** `level=state`, `govBranch=legislative`

---

### 3. `openstates_executive` — Open States people YAML

| | |
|---|---|
| **Coverage** | State executive officials (governor, SOS, AG, etc.) |
| **URL** | GitHub `data/{st}/executive/*.yml` via [openstates/people](https://github.com/openstates/people) |
| **License** | Open / community-maintained |
| **API key** | None (GitHub API for directory listing) |
| **Adapter** | `openstates-yaml.adapter.ts` |

**Source schema (abbreviated):**

```yaml
id: ocd-person/...
name: Katie Hobbs
party:
  - name: Democratic
roles:
  - type: governor
    jurisdiction: ocd-jurisdiction/country:us/state:az/government
    start_date: "2023-01-02"
    end_date: "2027-01-04"
offices:
  - classification: capitol
    address: ...
    voice: ...
```

**Maps to:** `level=state`, `govBranch=executive`

> Note: Open States YAML currently has partial AZ executive coverage (Governor, SOS, AG). Missing officers are supplemented by `az_executive_supplement` (local JSON).

---

### 4. `az_executive_supplement` — Local JSON

| | |
|---|---|
| **Coverage** | AZ state executives missing from Open States (Treasurer, Supt., Mine Inspector) |
| **URL** | `server/data/az-executive-supplement.json` |
| **Adapter** | `az-executive-supplement.adapter.ts` |

**Maps to:** `level=state`, `govBranch=executive`

---

### 5. `openstates_municipalities` — Open States people YAML

| | |
|---|---|
| **Coverage** | Mayors of major AZ cities tracked in openstates/people |
| **URL** | GitHub `data/{st}/municipalities/*.yml` |
| **Adapter** | `openstates-yaml.adapter.ts` |

**Maps to:** `level=municipal`, `govBranch=executive`, `roleType=mayor`

---

## Tier B — Planned / optional sources

| Source | Coverage | Notes |
|--------|----------|-------|
| [Congress.gov API v3](https://api.congress.gov/) | Federal enrichment | Free key; historically unstable — YAML is primary |
| [Open States GraphQL v3](https://docs.openstates.org/api-v3/) | State bills + people | API key required; bulk YAML preferred for roster sync |
| [CIV.IQ](https://github.com/civdotiq/civ.iq) | Aggregator | MIT; local coverage limited |
| [Cicero API](https://app.cicerodata.com/docs/) | County + city officials | Commercial; best for comprehensive local coverage |
| Manual county roster | AZ sheriffs (15 counties) | Phase 2b — no free bulk API |

---

## Scraper orchestration

`POST /api/scraper/trigger` runs all Tier A adapters for a state (default `AZ`):

1. Fetch raw data from each source
2. Transform to `CanonicalOfficial[]`
3. Replace DB rows per `(state, source)` — does not affect other sources
4. Log each source in `scrape_logs`

`GET /api/scraper/sources` lists registered adapters.

---

## Multi-state expansion

Pass `{ "state": "NM" }` to the scraper trigger. Adapters parameterize on state code:

- Congress YAML is filtered by `terms[].state`
- Open States paths use `data/{st}/...`
- CSV URL uses `{st}.csv`

Add new states by running the scraper with their postal code — no code changes required for states covered by Open States + congress-legislators.
