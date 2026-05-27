# Arizona Boundaries Map

**Interactive political & geographic map of Arizona** — counties, 1000+ cities, tribal lands, and a full **Political Snapshot** of current elected officials.

Built with **Leaflet.js** + Tailwind CSS.

## Live Demo
[https://MKThai.github.io/arizona-boundaries-map/](https://MKThai.github.io/arizona-boundaries-map/)

## Features
- **Political Snapshot** (new!): Click the button top-right for a beautiful modal with:
  - Current Executive officials (color-coded by party)
  - Legislature composition with visual bars
  - Federal delegation (U.S. Senators + House)
  - 2026 election outlook
- Dynamic Cities sidebar (searchable, clickable to fly to on map)
- 1000+ cities powered by GeoNames API
- Toggleable layers (Counties, Cities, Tribal)

## Full-stack deployment

For the Angular + Express + Postgres stack, see **[docs/DEPLOY.md](docs/DEPLOY.md)** (Neon + Render + Cloudflare Pages).

## Quick Start (legacy static map)
1. `git clone` the repo
2. Open `index.html`
3. Click **Political Snapshot** (top right) for instant overview
4. Use the left sidebar to explore/search cities

## GeoNames Setup (required for full cities data)
- Sign up free at [geonames.org](https://www.geonames.org/)
- Replace `luuthai` in `index.html` with your username

## Next Steps
- Add tribal reservation boundaries
- District-level legislative maps
- Candidate filing tracker for 2026

Contributions welcome!