# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a static single-page web application (Arizona Boundaries Map) with no build system, no package manager, and no backend. The entire app is `index.html` plus a `data/` directory with GeoJSON.

### Running the application

Serve with any static HTTP server from the repository root:

```
python3 -m http.server 8080 --directory /workspace
```

Then open `http://localhost:8080/` in Chrome. A static file server is required (not `file://`) because the app uses `fetch()` for local JSON data.

### Key notes

- **No build step**: There is no compile, transpile, or bundle step.
- **No package manager**: No `package.json`, no `node_modules`, no lockfiles.
- **No automated tests**: There are no test frameworks or test files in this repo.
- **No linter configured**: No ESLint, Prettier, or similar tool is set up.
- **External CDN dependencies**: Leaflet.js and Tailwind CSS are loaded from CDNs at runtime; internet access is required for the app to render properly.
- **External data APIs**: County GeoJSON (Plotly GitHub), legislator data (Open States CSV) are fetched at runtime.
- **Missing images**: `data/images/*.jpg` (politician headshots) are referenced in code but not committed to the repo; the app works without them (shows broken image placeholders).
