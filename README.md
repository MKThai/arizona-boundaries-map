# Arizona Boundaries Map

Interactive web map of Arizona showing counties, cities, towns, tribal lands, and other municipal boundaries.

Built with **Leaflet.js** — lightweight, free, and mobile-friendly.

## Live Demo
[https://MKThai.github.io/arizona-boundaries-map/](https://MKThai.github.io/arizona-boundaries-map/)

## Features
- Arizona counties with popups
- **Dynamic Cities & Towns** powered by GeoNames API (pulls 1000+ populated places in Arizona)
- Toggleable layers
- Easy to extend with your own GeoJSON data

## Quick Start
1. Clone the repo
2. Open `index.html` in your browser — it works immediately!
3. **Important:** The cities layer uses the GeoNames API. By default it uses the public `demo` username (limited). For full use:
   - Sign up for a free account at [https://www.geonames.org/](https://www.geonames.org/)
   - Verify your email
   - Go to your account page and enable web services
   - Copy your username and replace `'demo'` in `index.html` (line ~45)

## Adding Data
See the comments in `index.html` for how to load your own boundary files.

## Next Steps
- Tribal Reservations (22 in Arizona)
- School districts, legislative districts, etc.
- Search bar, basemap switcher, data popups
- Add more filters (population > 10k, etc.)

Contributions welcome! Fork, add layers, and submit a PR.

Made with ❤️ by Grok + MKThai