# Meridian — World Clocks & Weather

A live canvas of world clocks and current conditions. London and Chennai start on the canvas; search any city, country, abbreviation, or IANA time zone to pin more.

Meridian is a small, dependency-free static site with an editorial dark interface. It runs directly in the browser and ships as a Docker image served by nginx.

## Highlights

- **317 time zones across 247 countries and regions** in a bundled, searchable index.
- **Live local weather** for every pinned city, with animated day/night scene icons.
- **DST-aware clocks** using the browser's `Intl` API — no server-side clock data.
- **Flexible canvas** that reflows from one to four columns and keeps every selected zone visible.
- **Difference at a glance** — with two zones the centre badge shows their offset; with three or more each panel shows its delta from the first zone.
- **Searchable aliases** including `Delhi`, `Bombay`, `NYC`, and `IST`.
- **Remembered selection** in `localStorage`, with a ten-minute weather cache and graceful stale/offline states.
- **No build step, no API key, no trackers.**

## Run it

```bash
docker compose up --build -d
```

Open [http://localhost:8080](http://localhost:8080).

Stop the container with:

```bash
docker compose down
```

For a quick preview without Docker:

```bash
cd site && python3 -m http.server 8080
```

## How it works

The clock values come from the browser's `Intl.DateTimeFormat` and `Intl.supportedValuesOf`, so daylight-saving transitions are handled locally. The bundled data supplies zone metadata, search aliases, and city coordinates.

Weather is requested from [Open-Meteo](https://open-meteo.com/) for the coordinates of each pinned city. A reading is cached for ten minutes; if a refresh fails, the last known reading stays visible with a stale marker. Panels without a reading show a clear unavailable state instead of inventing data.

The layout is CSS Grid with container queries for the panels. Weather icons are inline SVG — sun, moon, cloud, rain, snow, fog, and thunder each have a restrained scene animation, with a reduced-motion fallback.

## Project structure

```text
.
├── site/
│   ├── index.html              page structure and city picker
│   ├── styles.css              layout, typography, motion, responsive grid
│   ├── app.js                  clocks, weather, search, selection, persistence
│   ├── assets/fonts/           self-hosted Instrument Sans and Instrument Serif
│   └── data/
│       ├── timezones.js        bundled tzdb metadata and aliases
│       ├── places.js           bundled city coordinates for weather lookup
│       ├── LICENSE-tzdb.txt    tzdb attribution
│       └── NOTICE-weather.txt  Open-Meteo and GeoNames attribution
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── README.md
```

## Data & attribution

- Time-zone metadata is derived from [@vvo/tzdb](https://github.com/vvo/tzdb) and distributed under the MIT license. See [`site/data/LICENSE-tzdb.txt`](site/data/LICENSE-tzdb.txt).
- Weather comes from [Open-Meteo](https://open-meteo.com/).
- City coordinates are derived from [GeoNames](https://www.geonames.org/) `cities15000` and `cities5000`, with small curated coordinates for remote stations and islands.

Open-Meteo and GeoNames data are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Full attribution is in [`site/data/NOTICE-weather.txt`](site/data/NOTICE-weather.txt).

## License

MIT — see [LICENSE](LICENSE).
