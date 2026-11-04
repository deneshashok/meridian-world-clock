(() => {
  "use strict";

  /* ---------------------------------------------------------------------
     Time zone data
     --------------------------------------------------------------------- */

  const FALLBACK_DATA = [
    {
      name: "Europe/London",
      alternativeName: "United Kingdom Time",
      continentCode: "EU",
      continentName: "Europe",
      countryName: "United Kingdom",
      countryCode: "GB",
      mainCities: ["London", "Birmingham", "Glasgow", "Manchester"],
      rawOffsetInMinutes: 0,
      abbreviation: "GMT",
      dstAbbreviation: "BST",
    },
    {
      name: "Asia/Kolkata",
      alternativeName: "India Time",
      continentCode: "AS",
      continentName: "Asia",
      countryName: "India",
      countryCode: "IN",
      mainCities: ["Mumbai", "Delhi", "Bengaluru", "Hyderabad"],
      rawOffsetInMinutes: 330,
      abbreviation: "IST",
    },
    {
      name: "America/New_York",
      alternativeName: "Eastern Time",
      continentCode: "NA",
      continentName: "North America",
      countryName: "United States",
      countryCode: "US",
      mainCities: ["New York City", "Brooklyn", "Queens", "Philadelphia"],
      rawOffsetInMinutes: -300,
      abbreviation: "EST",
      dstAbbreviation: "EDT",
    },
    {
      name: "America/Los_Angeles",
      alternativeName: "Pacific Time",
      continentCode: "NA",
      continentName: "North America",
      countryName: "United States",
      countryCode: "US",
      mainCities: ["Los Angeles", "San Diego", "San Jose"],
      rawOffsetInMinutes: -480,
      abbreviation: "PST",
      dstAbbreviation: "PDT",
    },
    {
      name: "Asia/Tokyo",
      alternativeName: "Japan Time",
      continentCode: "AS",
      continentName: "Asia",
      countryName: "Japan",
      countryCode: "JP",
      mainCities: ["Tokyo", "Yokohama", "Osaka"],
      rawOffsetInMinutes: 540,
      abbreviation: "JST",
    },
    {
      name: "Australia/Sydney",
      alternativeName: "Eastern Australia Time",
      continentCode: "OC",
      continentName: "Oceania",
      countryName: "Australia",
      countryCode: "AU",
      mainCities: ["Sydney", "Melbourne", "Newcastle"],
      rawOffsetInMinutes: 600,
      abbreviation: "AEST",
      dstAbbreviation: "AEDT",
    },
  ];

  const DATA =
    Array.isArray(window.MERIDIAN_TIMEZONES) && window.MERIDIAN_TIMEZONES.length
      ? window.MERIDIAN_TIMEZONES
      : FALLBACK_DATA;

  const STORAGE_KEY = "meridian.canvas.v1";
  const WEATHER_CACHE_KEY = "meridian.weather.v1";
  const WEATHER_TTL = 10 * 60 * 1000;
  const WEATHER_MAX_AGE = 24 * 60 * 60 * 1000;
  const WEATHER_RETRY_DELAY = 45 * 1000;
  const WEATHER_TIMEOUT = 12 * 1000;
  const WEATHER_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

  const DEFAULT_SELECTION = [
    { zone: "Europe/London", label: "London" },
    { zone: "Asia/Kolkata", label: "Chennai" },
  ];

  const PRIMARY_OVERRIDES = {
    "Asia/Kolkata": "Chennai",
  };

  const EXTRA_ALIASES = {
    "Europe/London": ["London", "Manchester", "Edinburgh", "Birmingham", "Glasgow"],
    "Asia/Kolkata": [
      "Chennai",
      "Madras",
      "New Delhi",
      "Delhi",
      "Mumbai",
      "Bombay",
      "Bengaluru",
      "Bangalore",
      "Kolkata",
      "Calcutta",
      "Hyderabad",
    ],
    "America/New_York": ["New York", "NYC", "Philadelphia", "Brooklyn", "Queens"],
    "America/Los_Angeles": ["Los Angeles", "LA", "San Diego", "San Jose"],
    "Asia/Dubai": ["Dubai", "Abu Dhabi", "Sharjah"],
    "Asia/Singapore": ["Singapore"],
    "Asia/Hong_Kong": ["Hong Kong"],
    "Europe/Paris": ["Paris", "Lyon", "Marseille"],
    "Australia/Sydney": ["Sydney", "Melbourne", "Canberra"],
    "Pacific/Auckland": ["Auckland", "Wellington"],
  };

  const CITY_SUFFIX_KEEP = new Set([
    "Mexico City",
    "Guatemala City",
    "Panama City",
    "Kuwait City",
    "Vatican City",
    "Ho Chi Minh City",
    "Quebec City",
    "Salt Lake City",
    "Oklahoma City",
    "Kansas City",
    "Carson City",
    "Atlantic City",
    "Panama City Beach",
  ]);

  const POPULAR = [
    "America/New_York",
    "America/Los_Angeles",
    "America/Toronto",
    "America/Mexico_City",
    "America/Sao_Paulo",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Istanbul",
    "Europe/Moscow",
    "Africa/Cairo",
    "Africa/Lagos",
    "Africa/Johannesburg",
    "Africa/Nairobi",
    "Asia/Dubai",
    "Asia/Karachi",
    "Asia/Kolkata",
    "Asia/Singapore",
    "Asia/Hong_Kong",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Asia/Seoul",
    "Australia/Sydney",
    "Pacific/Auckland",
    "Pacific/Honolulu",
  ];

  const ACCENTS = [
    { hex: "#93bbdd", rgb: "147, 187, 221" },
    { hex: "#f2a65c", rgb: "242, 166, 92" },
    { hex: "#9fc6a4", rgb: "159, 198, 164" },
    { hex: "#e2a0ad", rgb: "226, 160, 173" },
    { hex: "#b6a7e6", rgb: "182, 167, 230" },
    { hex: "#84c9c2", rgb: "132, 201, 194" },
    { hex: "#d9c68c", rgb: "217, 198, 140" },
    { hex: "#e99780", rgb: "233, 151, 128" },
  ];

  const MONTHS = {
    January: "01",
    February: "02",
    March: "03",
    April: "04",
    May: "05",
    June: "06",
    July: "07",
    August: "08",
    September: "09",
    October: "10",
    November: "11",
    December: "12",
  };

  const ICON_X =
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';
  const ICON_PLUS =
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  const ICON_CHECK =
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 8.4l3 3.1 6.6-7" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------------------------------------------------------------------
     Weather data
     --------------------------------------------------------------------- */

  const PLACE_DATA =
    window.MERIDIAN_PLACES && typeof window.MERIDIAN_PLACES === "object"
      ? window.MERIDIAN_PLACES
      : {};
  const ZONE_PLACES =
    window.MERIDIAN_ZONE_PLACES && typeof window.MERIDIAN_ZONE_PLACES === "object"
      ? window.MERIDIAN_ZONE_PLACES
      : {};

  // WMO 4677 weather interpretation codes, as returned by Open-Meteo.
  const WMO = {
    0: { label: "Clear sky", icon: "clear" },
    1: { label: "Mainly clear", icon: "partly" },
    2: { label: "Partly cloudy", icon: "partly" },
    3: { label: "Overcast", icon: "cloudy" },
    45: { label: "Fog", icon: "fog" },
    48: { label: "Rime fog", icon: "fog" },
    51: { label: "Light drizzle", icon: "drizzle" },
    53: { label: "Drizzle", icon: "drizzle" },
    55: { label: "Heavy drizzle", icon: "drizzle" },
    56: { label: "Freezing drizzle", icon: "drizzle" },
    57: { label: "Freezing drizzle", icon: "drizzle" },
    61: { label: "Light rain", icon: "rain" },
    63: { label: "Rain", icon: "rain" },
    65: { label: "Heavy rain", icon: "rain" },
    66: { label: "Freezing rain", icon: "rain" },
    67: { label: "Freezing rain", icon: "rain" },
    71: { label: "Light snow", icon: "snow" },
    73: { label: "Snow", icon: "snow" },
    75: { label: "Heavy snow", icon: "snow" },
    77: { label: "Snow grains", icon: "snow" },
    80: { label: "Light showers", icon: "rain" },
    81: { label: "Showers", icon: "rain" },
    82: { label: "Heavy showers", icon: "rain" },
    85: { label: "Snow showers", icon: "snow" },
    86: { label: "Heavy snow showers", icon: "snow" },
    95: { label: "Thunderstorm", icon: "thunder" },
    96: { label: "Storm with hail", icon: "thunder" },
    99: { label: "Storm with hail", icon: "thunder" },
  };

  const WI_OPEN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  const WI_CLOUD =
    '<path class="wi-cloud" d="M17.5 19a4.5 4.5 0 0 0 .4-8.98 6.5 6.5 0 0 0-12.1-1.3A4.2 4.2 0 0 0 6.5 19h11Z"/>';

  const WEATHER_ICONS = {
    "clear-day": `${WI_OPEN}<g class="wi-accent"><circle class="wi-sun-core" cx="12" cy="12" r="4.1"/><path class="wi-sun-rays" d="M12 2.4v2.1M12 19.5v2.1M2.4 12h2.1M19.5 12h2.1M5.2 5.2l1.5 1.5M17.3 17.3l1.5 1.5M18.8 5.2l-1.5 1.5M6.7 17.3l-1.5 1.5"/></g></svg>`,
    "clear-night": `${WI_OPEN}<g class="wi-accent"><path class="wi-moon" d="M15.1 4.4a7.6 7.6 0 1 0 4.4 11.3A8 8 0 0 1 15.1 4.4Z"/><path class="wi-stars" d="M5.4 6.2v1.9M4.5 7.1h1.9M17.4 17.3v1.4M16.7 18h1.4"/></g></svg>`,
    "partly-day": `${WI_OPEN}<g class="wi-accent"><circle class="wi-sun-core" cx="8.4" cy="8.2" r="2.7"/><path class="wi-sun-rays" d="M8.4 2.6v1.6M2.8 8.2h1.6M4.4 4.2l1.1 1.1M12.4 4.2l-1.1 1.1M2.6 12l1.2-1.2"/></g>${WI_CLOUD}</svg>`,
    "partly-night": `${WI_OPEN}<g class="wi-accent"><path class="wi-moon" d="M13 3.6a5.3 5.3 0 1 0 5 8.2A5.8 5.8 0 0 1 13 3.6Z"/><path class="wi-stars" d="M5 6.4v1.4M4.3 7.1h1.4"/></g>${WI_CLOUD}</svg>`,
    cloudy: `${WI_OPEN}${WI_CLOUD}<path class="wi-cloud-back" d="M7.6 7.2a5.4 5.4 0 0 1 8.6-.5" opacity=".5"/></svg>`,
    fog: `${WI_OPEN}<path class="wi-cloud" d="M17.4 16.4a4.3 4.3 0 0 0 .4-8.6A6.2 6.2 0 0 0 6.6 6.5a4 4 0 0 0 .1 9.9h10.7Z"/><path class="wi-fog" d="M6.8 20h10.4M8.6 22.3h7"/></svg>`,
    drizzle: `${WI_OPEN}${WI_CLOUD}<g class="wi-accent wi-drizzle"><path d="M9 20.4l-.7 1.9"/><path d="M12.4 20.4l-.7 1.9"/><path d="M15.8 20.4l-.7 1.9"/></g></svg>`,
    rain: `${WI_OPEN}${WI_CLOUD}<g class="wi-accent wi-rain"><path d="M8.8 20.2l-1.4 2.6"/><path d="M12 20.2l-1.4 2.6"/><path d="M15.2 20.2l-1.4 2.6"/></g></svg>`,
    snow: `${WI_OPEN}${WI_CLOUD}<g class="wi-accent wi-snow"><g class="wi-flake"><path d="M9 20.6v2.9M7.7 21.3l2.6 1.5M10.3 21.3l-2.6 1.5"/></g><g class="wi-flake"><path d="M15.2 20.6v2.9M13.9 21.3l2.6 1.5M16.5 21.3l-2.6 1.5"/></g></g></svg>`,
    thunder: `${WI_OPEN}${WI_CLOUD}<path class="wi-accent wi-bolt" d="M13 18.8l-1.8 2.8h2.2l-1.4 2.2"/></svg>`,
    loading: `${WI_OPEN}<circle class="wi-ring" cx="12" cy="12" r="7.2" opacity=".3"/><path class="wi-accent wi-ring-arc" d="M12 4.8a7.2 7.2 0 0 1 6.2 3.6"/></svg>`,
    error: `${WI_OPEN}${WI_CLOUD}<path class="wi-slash" d="M4.2 4.2l15.6 15.6"/></svg>`,
  };

  function weatherInfo(code, isDay) {
    const entry = WMO[Number(code)] || WMO[3];
    const icon =
      entry.icon === "clear" || entry.icon === "partly"
        ? `${entry.icon}-${isDay ? "day" : "night"}`
        : entry.icon;
    return { label: entry.label, icon: WEATHER_ICONS[icon] || WEATHER_ICONS.cloudy };
  }

  /* ---------------------------------------------------------------------
     Data helpers
     --------------------------------------------------------------------- */

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[\u2019']/g, "")
      .replace(/[._/\\-]+/g, " ")
      .replace(/[^a-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function cleanCity(name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) return "";
    if (/ City$/.test(trimmed) && !CITY_SUFFIX_KEEP.has(trimmed)) {
      return trimmed.slice(0, -5);
    }
    return trimmed;
  }

  function primaryLabel(data) {
    if (PRIMARY_OVERRIDES[data.name]) return PRIMARY_OVERRIDES[data.name];
    const city = cleanCity((data.mainCities || [])[0]);
    if (city) return city;
    const tail = String(data.name || "").split("/").pop();
    return cleanCity(tail.replace(/_/g, " "));
  }

  function regionFor(data) {
    if (data.continentCode === "EU") return "Europe";
    if (data.continentCode === "AS") return "Asia";
    if (data.continentCode === "AF") return "Africa";
    if (data.continentCode === "NA" || data.continentCode === "SA") return "Americas";
    if (data.continentCode === "OC") return "Oceania";
    return "Other";
  }

  function uniqueNames(names) {
    const seen = new Set();
    const out = [];
    names.forEach((name) => {
      const cleaned = cleanCity(name);
      const key = normalize(cleaned);
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(cleaned);
    });
    return out;
  }

  const POPULAR_RANK = new Map(POPULAR.map((zone, index) => [zone, index]));

  const ENTRIES = DATA.map((data) => {
    const label = primaryLabel(data);
    const cityNames = uniqueNames([
      label,
      ...(data.mainCities || []),
      ...(EXTRA_ALIASES[data.name] || []),
    ]);

    return {
      data,
      label,
      labelNorm: normalize(label),
      cities: cityNames.map((name) => ({ name, norm: normalize(name) })),
      countryNorm: normalize(data.countryName),
      zoneNorm: normalize(data.name),
      altNorm: normalize(data.alternativeName),
      abbrNorms: [
        ...new Set(
          [data.abbreviation, data.dstAbbreviation]
            .filter(Boolean)
            .map((value) => normalize(value)),
        ),
      ],
      region: regionFor(data),
      popularRank: POPULAR_RANK.has(data.name) ? POPULAR_RANK.get(data.name) : Infinity,
    };
  });

  const ENTRY_BY_ZONE = new Map(ENTRIES.map((entry) => [entry.data.name, entry]));

  /* ---------------------------------------------------------------------
     Dates & clocks
     --------------------------------------------------------------------- */

  const longFormatterCache = new Map();
  const numericFormatterCache = new Map();
  const localTimeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  function getLongFormatter(timeZone) {
    let formatter = longFormatterCache.get(timeZone);

    if (!formatter) {
      try {
        formatter = new Intl.DateTimeFormat("en-GB", {
          timeZone,
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
          timeZoneName: "longOffset",
        });
      } catch {
        formatter = new Intl.DateTimeFormat("en-GB", {
          timeZone: "UTC",
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hourCycle: "h23",
          timeZoneName: "longOffset",
        });
      }
      longFormatterCache.set(timeZone, formatter);
    }

    return formatter;
  }

  function getNumericFormatter(timeZone) {
    let formatter = numericFormatterCache.get(timeZone);

    if (!formatter) {
      try {
        formatter = new Intl.DateTimeFormat("en-CA", {
          timeZone,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      } catch {
        formatter = new Intl.DateTimeFormat("en-CA", {
          timeZone: "UTC",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
      }
      numericFormatterCache.set(timeZone, formatter);
    }

    return formatter;
  }

  function partsFor(timeZone, date) {
    return Object.fromEntries(
      getLongFormatter(timeZone)
        .formatToParts(date)
        .map((part) => [part.type, part.value]),
    );
  }

  function dayNumberFor(timeZone, date) {
    const parts = Object.fromEntries(
      getNumericFormatter(timeZone)
        .formatToParts(date)
        .map((part) => [part.type, part.value]),
    );
    return Math.floor(
      Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / 86400000,
    );
  }

  function localDayNumber(date) {
    return Math.floor(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000,
    );
  }

  function offsetFromParts(parts) {
    const name = parts.timeZoneName || "GMT";
    const match = name.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);

    if (!match) return 0;

    const direction = match[1] === "-" ? -1 : 1;
    return direction * (Number(match[2]) * 60 + Number(match[3] || 0));
  }

  function formatOffset(minutes) {
    const sign = minutes < 0 ? "-" : "+";
    const absolute = Math.abs(minutes);
    const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
    const mins = String(absolute % 60).padStart(2, "0");
    return `UTC ${sign}${hours}:${mins}`;
  }

  function formatDelta(minutes) {
    if (minutes === 0) return "0:00";
    const sign = minutes > 0 ? "+" : "-";
    const absolute = Math.abs(minutes);
    const hours = Math.floor(absolute / 60);
    const mins = String(absolute % 60).padStart(2, "0");
    return `${sign}${hours}:${mins}`;
  }

  function abbreviationFor(data, offset) {
    if (typeof data.rawOffsetInMinutes === "number" && data.rawOffsetInMinutes !== offset) {
      return data.dstAbbreviation || data.abbreviation || formatOffset(offset);
    }
    return data.abbreviation || data.dstAbbreviation || formatOffset(offset);
  }

  function phaseFor(hour) {
    if (hour >= 5 && hour < 7) return "Dawn";
    if (hour >= 7 && hour < 12) return "Morning";
    if (hour >= 12 && hour < 17) return "Afternoon";
    if (hour >= 17 && hour < 20) return "Evening";
    return "Night";
  }

  /* ---------------------------------------------------------------------
     State & elements
     --------------------------------------------------------------------- */

  const canvas = document.getElementById("canvas");
  const selectionElement = document.getElementById("selection");
  const zoneCountElement = document.getElementById("zone-count");
  const routeElement = document.getElementById("route");
  const utcElement = document.getElementById("utc-time");
  const localElement = document.getElementById("local-time");
  const addButton = document.getElementById("add-city");
  const emptyAddButton = document.getElementById("empty-add");
  const emptyElement = document.getElementById("empty");
  const meridian = document.getElementById("meridian");
  const difference = document.getElementById("difference");
  const differenceValue = document.getElementById("difference-value");
  const differenceLabel = document.getElementById("difference-label");
  const announcer = document.getElementById("announcer");

  const picker = document.getElementById("picker");
  const pickerClose = document.getElementById("picker-close");
  const pickerDone = document.getElementById("picker-done");
  const pickerSearch = document.getElementById("picker-search");
  const pickerFilters = document.getElementById("picker-filters");
  const pickerStatus = document.getElementById("picker-status");
  const pickerResults = document.getElementById("picker-results");
  const pickerEmpty = document.getElementById("picker-empty");
  const pickerSelectedCount = document.getElementById("picker-selected-count");
  const pickerAnnouncer = document.getElementById("picker-announcer");

  const pointerFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const views = new Map();
  let selection = loadSelection();
  let pickerRegion = "all";
  let lastPickerMinute = "";
  let lastTitleKey = "";

  function loadSelection() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_SELECTION.map((entry) => ({ ...entry }));

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return DEFAULT_SELECTION.map((entry) => ({ ...entry }));

      const seen = new Set();
      const out = [];

      parsed.forEach((item) => {
        if (!item || typeof item.zone !== "string" || seen.has(item.zone)) return;
        const entry = ENTRY_BY_ZONE.get(item.zone);
        if (!entry) return;
        seen.add(item.zone);
        const label =
          typeof item.label === "string" && item.label.trim()
            ? item.label.trim().slice(0, 48)
            : entry.label;
        out.push({ zone: item.zone, label });
      });

      if (parsed.length > 0 && out.length === 0) {
        return DEFAULT_SELECTION.map((entry) => ({ ...entry }));
      }

      return out;
    } catch {
      return DEFAULT_SELECTION.map((entry) => ({ ...entry }));
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(selection.map((entry) => ({ zone: entry.zone, label: entry.label }))),
      );
    } catch {
      /* storage can be disabled — the session still works */
    }
  }

  function setText(element, value) {
    if (element && element.textContent !== value) element.textContent = value;
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
      switch (character) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        default:
          return "&#39;";
      }
    });
  }

  function announce(element, message) {
    if (!element) return;
    element.textContent = "";
    window.requestAnimationFrame(() => {
      element.textContent = message;
    });
  }

  /* ---------------------------------------------------------------------
     Weather
     --------------------------------------------------------------------- */

  const weatherCache = loadWeatherCache();

  function loadWeatherCache() {
    try {
      const raw = window.localStorage.getItem(WEATHER_CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === "object" && parsed.items && typeof parsed.items === "object") {
        return { items: parsed.items };
      }
    } catch {
      /* a corrupt or disabled cache should never block the clocks */
    }
    return { items: {} };
  }

  function saveWeatherCache() {
    try {
      window.localStorage.setItem(
        WEATHER_CACHE_KEY,
        JSON.stringify({ v: 1, items: weatherCache.items }),
      );
    } catch {
      /* storage can be full or disabled — weather still works for this visit */
    }
  }

  function coordsFor(zone, label) {
    const key = normalize(label);
    const list = PLACE_DATA[zone];

    if (Array.isArray(list) && key) {
      let hit = list.find((item) => normalize(item[0]) === key);

      // Tolerate small label differences such as New York / New York City.
      if (!hit && key.length >= 4) {
        hit = list.find((item) => {
          const name = normalize(item[0]);
          return name.length >= 4 && (name.includes(key) || key.includes(name));
        });
      }

      if (hit) return { lat: hit[1], lon: hit[2] };
    }

    const fallback = ZONE_PLACES[zone];
    if (Array.isArray(fallback)) return { lat: fallback[0], lon: fallback[1] };
    return null;
  }

  function weatherKeyFor(coords) {
    return `${coords.lat.toFixed(3)},${coords.lon.toFixed(3)}`;
  }

  function readCachedWeather(key) {
    const item = weatherCache.items[key];
    if (!item || !Number.isFinite(item.at)) return null;

    if (Date.now() - item.at > WEATHER_MAX_AGE) {
      delete weatherCache.items[key];
      saveWeatherCache();
      return null;
    }

    return item;
  }

  function writeCachedWeather(key, data) {
    weatherCache.items[key] = data;
    const cutoff = Date.now() - WEATHER_MAX_AGE;

    Object.keys(weatherCache.items).forEach((entryKey) => {
      const item = weatherCache.items[entryKey];
      if (!item || !Number.isFinite(item.at) || item.at < cutoff) {
        delete weatherCache.items[entryKey];
      }
    });

    saveWeatherCache();
  }

  function setWeatherLoading(view) {
    view.refs.weather.dataset.state = "loading";
    view.refs.weatherIcon.innerHTML = WEATHER_ICONS.loading;
    setText(view.refs.weatherTemp, "--°");
    setText(view.refs.weatherCondition, "Loading");
    view.refs.weather.setAttribute(
      "aria-label",
      `Loading weather for ${view.selectionEntry.label}`,
    );
    view.refs.weather.removeAttribute("title");
  }

  function setWeatherError(view) {
    view.refs.weather.dataset.state = "error";
    view.refs.weatherIcon.innerHTML = WEATHER_ICONS.error;
    setText(view.refs.weatherTemp, "—");
    setText(view.refs.weatherCondition, "Unavailable");
    view.refs.weather.setAttribute(
      "aria-label",
      `Weather unavailable for ${view.selectionEntry.label}`,
    );
    view.refs.weather.title = "Live weather is unavailable right now.";
  }

  function renderWeatherData(view, data, stale = false) {
    const info = weatherInfo(data.code, data.isDay);
    const temperature = Math.round(data.temp);
    const feels = Number.isFinite(data.feels) ? Math.round(data.feels) : null;
    const updated = new Date(data.at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    view.refs.weather.dataset.state = stale ? "stale" : "ready";
    view.refs.weather.classList.remove("is-enter");
    if (!stale) {
      /* restart the arrival animation when a fresh reading is rendered */
      void view.refs.weather.offsetWidth;
      view.refs.weather.classList.add("is-enter");
    }
    view.refs.weatherIcon.innerHTML = info.icon;
    setText(view.refs.weatherTemp, `${temperature}°`);
    setText(view.refs.weatherCondition, info.label);
    view.weather.renderedAt = data.at;
    view.weather.renderedLabel = view.selectionEntry.label;

    const spoken = [`${info.label}, ${temperature} degrees Celsius`];
    if (feels !== null) spoken.push(`feels like ${feels} degrees`);
    view.refs.weather.setAttribute(
      "aria-label",
      `${view.selectionEntry.label}: ${spoken.join(", ")}${
        stale ? ". Showing the last available reading." : "."
      }`,
    );

    const title = [`${temperature}°C`, info.label];
    if (feels !== null) title.push(`feels ${feels}°C`);
    if (Number.isFinite(data.wind)) title.push(`${Math.round(data.wind)} km/h wind`);
    if (Number.isFinite(data.humidity)) title.push(`${Math.round(data.humidity)}% humidity`);
    title.push(`updated ${updated}`);
    view.refs.weather.title = title.join(" · ");
  }

  function requestWeather(view, key, coords) {
    const bucket = view.weather;

    if (typeof window.fetch !== "function" || typeof window.AbortController !== "function") {
      if (bucket.data) renderWeatherData(view, bucket.data, true);
      else setWeatherError(view);
      return;
    }

    const controller = new AbortController();
    const url = new URL(WEATHER_ENDPOINT);

    bucket.controller = controller;
    bucket.lastAttempt = Date.now();
    if (!bucket.data) setWeatherLoading(view);

    url.searchParams.set("latitude", String(coords.lat));
    url.searchParams.set("longitude", String(coords.lon));
    url.searchParams.set(
      "current",
      "temperature_2m,weather_code,is_day,apparent_temperature,relative_humidity_2m,wind_speed_10m",
    );
    url.searchParams.set("timezone", "auto");

    const timeout = window.setTimeout(() => controller.abort(), WEATHER_TIMEOUT);

    window
      .fetch(url.toString(), { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error(`Weather request failed: ${response.status}`);
        return response.json();
      })
      .then((payload) => {
        if (bucket.controller !== controller || view.weather !== bucket) return;

        const current = payload && payload.current;
        const temperature = Number(current && current.temperature_2m);
        const code = Number(current && current.weather_code);

        if (!Number.isFinite(temperature) || !Number.isFinite(code)) {
          throw new Error("Weather response was incomplete");
        }

        const data = {
          at: Date.now(),
          temp: temperature,
          code,
          isDay: Number(current.is_day) === 1,
          feels: Number(current.apparent_temperature),
          humidity: Number(current.relative_humidity_2m),
          wind: Number(current.wind_speed_10m),
        };

        bucket.data = data;
        writeCachedWeather(key, data);
        renderWeatherData(view, data);
      })
      .catch((error) => {
        if (bucket.controller !== controller || view.weather !== bucket) return;
        if (error && error.name === "AbortError") return;
        if (bucket.data) renderWeatherData(view, bucket.data, true);
        else setWeatherError(view);
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (bucket.controller === controller) bucket.controller = null;
      });
  }

  function syncWeather(view, options = {}) {
    const coords = coordsFor(view.selectionEntry.zone, view.selectionEntry.label);

    if (!coords) {
      if (view.weather.controller) view.weather.controller.abort();
      view.weather = { key: null, data: null, controller: null, lastAttempt: 0 };
      setWeatherError(view);
      return;
    }

    const key = weatherKeyFor(coords);

    if (view.weather.key !== key) {
      if (view.weather.controller) view.weather.controller.abort();
      view.weather = {
        key,
        data: readCachedWeather(key),
        controller: null,
        lastAttempt: 0,
      };

      if (view.weather.data) renderWeatherData(view, view.weather.data);
      else setWeatherLoading(view);
    }

    const data = view.weather.data;
    const fresh = Boolean(data) && Date.now() - data.at < WEATHER_TTL;

    if (!options.force && fresh) {
      if (
        view.weather.renderedAt !== data.at ||
        view.weather.renderedLabel !== view.selectionEntry.label
      ) {
        renderWeatherData(view, data);
      }
      return;
    }

    if (view.weather.controller) return;

    if (window.navigator.onLine === false) {
      if (data) renderWeatherData(view, data, true);
      else setWeatherError(view);
      return;
    }

    if (
      !options.force &&
      view.weather.lastAttempt &&
      Date.now() - view.weather.lastAttempt < WEATHER_RETRY_DELAY
    ) {
      return;
    }

    requestWeather(view, key, coords);
  }

  /* ---------------------------------------------------------------------
     Zone panels
     --------------------------------------------------------------------- */

  function createView(selectionEntry, index) {
    const entry = ENTRY_BY_ZONE.get(selectionEntry.zone);
    if (!entry) return null;

    const label = selectionEntry.label;
    const safeLabel = escapeHTML(label);
    const titleId = `zone-title-${selectionEntry.zone.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
    const element = document.createElement("section");

    element.className = "zone";
    element.dataset.zone = selectionEntry.zone;
    element.setAttribute("aria-labelledby", titleId);

    element.innerHTML = `
      <div class="zone__aura" aria-hidden="true"></div>
      <div class="zone__cursor" aria-hidden="true"></div>
      <div class="zone__inner">
        <div class="zone__head">
          <span class="zone__index" aria-hidden="true">01</span>
          <span class="zone__country">${escapeHTML(entry.data.countryName)}</span>
          <div class="weather" data-state="loading" role="img" aria-label="Loading weather">
            <span class="weather__icon" aria-hidden="true"></span>
            <span class="weather__temp" aria-hidden="true">--°</span>
            <span class="weather__condition" aria-hidden="true">Loading</span>
          </div>
          <span class="phase">
            <span class="phase__dot" aria-hidden="true"></span>
            <span class="phase__text">Night</span>
          </span>
          <button class="zone__remove" type="button" aria-label="Remove ${safeLabel}">${ICON_X}</button>
        </div>
        <div class="zone__body">
          <div class="clock">
            <time class="clock__time" datetime="" aria-label="${safeLabel} time">
              <span class="clock__hm">--:--</span><span class="clock__seconds">:--</span>
            </time>
            <p class="clock__meta">
              <span class="clock__abbr">---</span>
              <span class="clock__offset">UTC +00:00</span>
              <span class="clock__delta" hidden></span>
            </p>
          </div>
          <div class="city">
            <h2 id="${titleId}">${safeLabel}</h2>
            <p class="zone__id">${escapeHTML(entry.data.name.replace(/_/g, " "))}</p>
          </div>
        </div>
        <div class="zone__foot">
          <div class="date">
            <span class="date__weekday">—</span>
            <span class="date__full">—</span>
          </div>
          <div class="hour-track" aria-hidden="true">
            <div class="hour-track__bars"></div>
            <div class="hour-track__labels"><span>00</span><span>12</span><span>24</span></div>
          </div>
        </div>
      </div>
    `;

    const refs = {
      index: element.querySelector(".zone__index"),
      country: element.querySelector(".zone__country"),
      weather: element.querySelector(".weather"),
      weatherIcon: element.querySelector(".weather__icon"),
      weatherTemp: element.querySelector(".weather__temp"),
      weatherCondition: element.querySelector(".weather__condition"),
      phase: element.querySelector(".phase__text"),
      remove: element.querySelector(".zone__remove"),
      time: element.querySelector(".clock__time"),
      hm: element.querySelector(".clock__hm"),
      seconds: element.querySelector(".clock__seconds"),
      abbr: element.querySelector(".clock__abbr"),
      offset: element.querySelector(".clock__offset"),
      delta: element.querySelector(".clock__delta"),
      title: element.querySelector("h2"),
      zoneId: element.querySelector(".zone__id"),
      weekday: element.querySelector(".date__weekday"),
      date: element.querySelector(".date__full"),
      bars: element.querySelector(".hour-track__bars"),
    };

    const bars = [];
    for (let hour = 0; hour < 24; hour += 1) {
      const bar = document.createElement("span");
      bar.className = "hour-track__bar";
      refs.bars.append(bar);
      bars.push(bar);
    }

    const view = {
      element,
      refs,
      bars,
      entry,
      selectionEntry,
      activeHour: null,
      state: { hour: 0, minute: 0, offset: 0 },
      weather: { key: null, data: null, controller: null, lastAttempt: 0 },
    };

    refs.remove.addEventListener("click", () => removeZone(selectionEntry.zone));

    if (pointerFine && !reducedMotion) {
      element.addEventListener("pointermove", (event) => {
        const bounds = element.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;
        element.style.setProperty("--mx", `${x.toFixed(2)}%`);
        element.style.setProperty("--my", `${y.toFixed(2)}%`);
      });

      element.addEventListener("pointerleave", () => {
        element.style.setProperty("--mx", "50%");
        element.style.setProperty("--my", "50%");
      });
    }

    updateViewChrome(view, selectionEntry, index);
    return view;
  }

  function updateViewChrome(view, selectionEntry, index) {
    const accent = ACCENTS[index % ACCENTS.length];
    const label = selectionEntry.label;

    view.selectionEntry = selectionEntry;
    view.entry = ENTRY_BY_ZONE.get(selectionEntry.zone) || view.entry;

    view.element.style.setProperty("--accent", accent.hex);
    view.element.style.setProperty("--accent-rgb", accent.rgb);
    view.element.dataset.zone = selectionEntry.zone;

    setText(view.refs.index, String(index + 1).padStart(2, "0"));
    setText(view.refs.country, view.entry.data.countryName);
    setText(view.refs.title, label);
    setText(view.refs.zoneId, view.entry.data.name.replace(/_/g, " "));
    view.refs.remove.setAttribute("aria-label", `Remove ${label}`);
    syncWeather(view);
  }

  function updateHourTrack(view, hour) {
    if (view.activeHour === hour) return;

    view.bars.forEach((bar, index) => {
      bar.classList.toggle("is-past", index < hour);
      bar.classList.toggle("is-now", index === hour);
    });

    view.activeHour = hour;
  }

  function updateViewTime(view, now) {
    const parts = partsFor(view.entry.data.name, now);
    const offset = offsetFromParts(parts);
    const hour = Number(parts.hour);
    const abbreviation = abbreviationFor(view.entry.data, offset);
    const timeLabel = `${parts.hour}:${parts.minute}:${parts.second}`;
    const dateTime = `${parts.year}-${MONTHS[parts.month] || "01"}-${String(parts.day).padStart(2, "0")}T${timeLabel}`;
    const ariaLabel = `${view.selectionEntry.label}: ${parts.weekday}, ${parts.day} ${parts.month} ${parts.year}, ${timeLabel}`;

    setText(view.refs.hm, `${parts.hour}:${parts.minute}`);
    setText(view.refs.seconds, `:${parts.second}`);
    setText(view.refs.weekday, parts.weekday);
    setText(view.refs.date, `${parts.day} ${parts.month} ${parts.year}`);
    setText(view.refs.abbr, abbreviation);
    setText(view.refs.offset, formatOffset(offset));
    setText(view.refs.phase, phaseFor(hour));

    if (view.refs.time.dateTime !== dateTime) view.refs.time.dateTime = dateTime;
    if (view.refs.time.getAttribute("aria-label") !== ariaLabel) {
      view.refs.time.setAttribute("aria-label", ariaLabel);
    }

    updateHourTrack(view, hour);
    view.state = { hour, minute: Number(parts.minute), offset };
  }

  function syncZones() {
    const wanted = new Set(selection.map((entry) => entry.zone));

    views.forEach((view, zone) => {
      if (!wanted.has(zone)) {
        if (view.weather.controller) view.weather.controller.abort();
        view.element.remove();
        views.delete(zone);
      }
    });

    selection.forEach((selectionEntry, index) => {
      const entry = ENTRY_BY_ZONE.get(selectionEntry.zone);
      if (!entry) return;

      let view = views.get(selectionEntry.zone);
      if (!view) {
        view = createView(selectionEntry, index);
        if (!view) return;
        views.set(selectionEntry.zone, view);
        view.element.classList.add("is-new");
        window.setTimeout(() => view.element.classList.remove("is-new"), 560);
      }

      updateViewChrome(view, selectionEntry, index);
      canvas.append(view.element);
    });

    canvas.dataset.count = String(selection.length);
    canvas.classList.toggle("is-dense", selection.length > 12);
    emptyElement.hidden = selection.length !== 0;
    meridian.hidden = selection.length !== 2;

    zoneCountElement.textContent = String(selection.length);
    routeElement.textContent = selection.length
      ? selection.map((entry) => entry.label).join(" — ")
      : "Empty canvas";

    renderChips();
    updatePickerSelection();
    persist();
    renderClocks();
  }

  function renderChips() {
    selectionElement.innerHTML = "";

    if (!selection.length) {
      const empty = document.createElement("span");
      empty.className = "selection__empty";
      empty.setAttribute("role", "listitem");
      empty.textContent = "No cities yet";
      selectionElement.append(empty);
      return;
    }

    selection.forEach((selectionEntry, index) => {
      const accent = ACCENTS[index % ACCENTS.length];
      const chip = document.createElement("div");
      chip.className = "chip";
      chip.setAttribute("role", "listitem");
      chip.style.setProperty("--chip-color", accent.hex);
      chip.style.setProperty("--chip-glow", `rgba(${accent.rgb}, 0.55)`);
      chip.innerHTML = `
        <button class="chip__label" type="button" aria-label="Show ${escapeHTML(selectionEntry.label)}">
          <span class="chip__dot" aria-hidden="true"></span>
          <span class="chip__name">${escapeHTML(selectionEntry.label)}</span>
        </button>
        <button class="chip__remove" type="button" aria-label="Remove ${escapeHTML(selectionEntry.label)}">${ICON_X}</button>
      `;

      chip.querySelector(".chip__label").addEventListener("click", () => {
        focusZone(selectionEntry.zone);
      });
      chip.querySelector(".chip__remove").addEventListener("click", () => {
        removeZone(selectionEntry.zone);
      });

      selectionElement.append(chip);
    });
  }

  function addZone(zone, label) {
    const entry = ENTRY_BY_ZONE.get(zone);
    if (!entry) return;

    const existing = selection.find((item) => item.zone === zone);
    if (existing) {
      closePicker();
      focusZone(zone);
      announce(announcer, `${existing.label} is already on the canvas.`);
      return;
    }

    const chosenLabel = label && label.trim() ? label.trim().slice(0, 48) : entry.label;
    selection.push({ zone, label: chosenLabel });
    syncZones();

    selectionElement.scrollLeft = selectionElement.scrollWidth;
    announce(pickerAnnouncer, `${chosenLabel} added. ${selection.length} zones on the canvas.`);
  }

  function removeZone(zone) {
    const index = selection.findIndex((entry) => entry.zone === zone);
    if (index === -1) return;

    const [removed] = selection.splice(index, 1);
    syncZones();
    announce(announcer, `${removed.label} removed from the canvas.`);

    window.requestAnimationFrame(() => {
      if (document.activeElement !== document.body) return;

      if (!selection.length) {
        addButton.focus({ preventScroll: true });
        return;
      }

      const chipLabels = selectionElement.querySelectorAll(".chip__label");
      const next = chipLabels[Math.min(index, chipLabels.length - 1)];
      if (next) next.focus({ preventScroll: true });
    });
  }

  function focusZone(zone) {
    const view = views.get(zone);
    if (!view) return;

    const bounds = view.element.getBoundingClientRect();
    if (bounds.top < 0 || bounds.bottom > window.innerHeight) {
      view.element.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "center",
        inline: "nearest",
      });
    }

    view.element.classList.remove("is-flash");
    void view.element.offsetWidth;
    view.element.classList.add("is-flash");
    window.setTimeout(() => view.element.classList.remove("is-flash"), 1100);
  }

  /* ---------------------------------------------------------------------
     Clock rendering
     --------------------------------------------------------------------- */

  function renderClocks(now = new Date()) {
    const offsets = [];

    utcElement.textContent = now.toISOString().slice(11, 19);
    utcElement.dateTime = now.toISOString();
    localElement.textContent = localTimeFormatter.format(now);

    selection.forEach((selectionEntry) => {
      const view = views.get(selectionEntry.zone);
      if (!view) return;
      updateViewTime(view, now);
      offsets.push(view.state.offset);
    });

    updateDeltas(offsets);
    updateMeridian(offsets);
    updateTitle();

    if (picker.open) updatePickerTimes(now);
  }

  function updateDeltas(offsets) {
    const show = selection.length >= 3;

    selection.forEach((selectionEntry, index) => {
      const view = views.get(selectionEntry.zone);
      if (!view) return;

      const delta = view.refs.delta;

      if (!show) {
        delta.hidden = true;
        return;
      }

      delta.hidden = false;

      if (index === 0) {
        delta.classList.add("clock__delta--ref");
        setText(delta, "Reference");
        return;
      }

      delta.classList.remove("clock__delta--ref");
      const minutes = offsets[index] - offsets[0];
      const reference = selection[0] ? selection[0].label : "base";
      setText(
        delta,
        minutes === 0 ? `Same as ${reference}` : `${formatDelta(minutes)} vs ${reference}`,
      );
    });
  }

  function updateMeridian(offsets) {
    if (selection.length !== 2 || offsets.length < 2) {
      meridian.hidden = true;
      return;
    }

    meridian.hidden = false;

    const differenceMinutes = offsets[1] - offsets[0];
    const absolute = Math.abs(differenceMinutes);
    const hours = Math.floor(absolute / 60);
    const minutes = absolute % 60;
    const firstName = selection[0].label;
    const secondName = selection[1].label;

    differenceValue.textContent =
      differenceMinutes === 0
        ? "0:00"
        : `${differenceMinutes > 0 ? "+" : "-"}${hours}:${String(minutes).padStart(2, "0")}`;

    differenceLabel.textContent =
      differenceMinutes === 0
        ? "Same time"
        : `${differenceMinutes > 0 ? secondName : firstName} ahead`;

    difference.setAttribute(
      "aria-label",
      differenceMinutes === 0
        ? `${firstName} and ${secondName} are on the same time`
        : `${secondName} is ${hours} hours ${minutes} minutes ${
            differenceMinutes > 0 ? "ahead of" : "behind"
          } ${firstName}`,
    );
  }

  function updateTitle() {
    const pieces = selection.map((selectionEntry) => {
      const view = views.get(selectionEntry.zone);
      return `${view ? view.refs.hm.textContent : "--:--"} ${selectionEntry.label}`;
    });

    const key = `${selection.map((entry) => entry.zone).join("|")}::${pieces.join("|")}`;
    if (key === lastTitleKey) return;
    lastTitleKey = key;

    if (!selection.length) {
      document.title = "Meridian — World Clocks";
    } else if (selection.length <= 2) {
      document.title = `${pieces.join(" · ")} — Meridian`;
    } else {
      document.title = `${pieces[0]} · ${pieces[1]} · +${selection.length - 2} — Meridian`;
    }
  }

  /* ---------------------------------------------------------------------
     Picker
     --------------------------------------------------------------------- */

  function scoreText(text, query) {
    if (!text || !query) return 99;
    if (text === query) return 0;
    if (text.startsWith(query)) return 1;
    if (text.includes(` ${query}`)) return 2;
    if (text.includes(query)) return 3;
    return 99;
  }

  function matchEntry(entry, query) {
    let best = null;

    entry.cities.forEach((city) => {
      const score = scoreText(city.norm, query);
      if (score < 99 && (!best || score < best.score)) {
        best = {
          score,
          title: city.name,
          field: "city",
          primary: city.norm === entry.labelNorm,
        };
      }
    });

    // An exact abbreviation (IST, BST, PST…) should beat cities that merely
    // contain the same letters, such as Istanbul or Christchurch.
    const abbreviationExact = entry.abbrNorms.some((value) => value === query);
    if (abbreviationExact && (!best || best.score > 0)) {
      return { score: 0.5, title: entry.label, field: "abbreviation" };
    }

    if (best) return best;

    const countryScore = scoreText(entry.countryNorm, query);
    if (countryScore < 99) {
      return { score: countryScore + 4, title: entry.label, field: "country" };
    }

    const abbreviationStart = entry.abbrNorms.some((value) => value.startsWith(query));
    if (abbreviationStart) {
      return { score: 6, title: entry.label, field: "abbreviation" };
    }

    const zoneScore = scoreText(entry.zoneNorm, query);
    if (zoneScore < 99) {
      return { score: zoneScore + 7, title: entry.label, field: "zone" };
    }

    const altScore = scoreText(entry.altNorm, query);
    if (altScore < 99) {
      return { score: altScore + 8, title: entry.label, field: "alternative" };
    }

    return null;
  }

  function findMatches(query, region) {
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
      if (region === "all") {
        const rows = POPULAR.map((zone) => ENTRY_BY_ZONE.get(zone))
          .filter(Boolean)
          .map((entry) => ({ entry, title: entry.label }));
        return {
          rows,
          status: `Popular · ${DATA.length} zones indexed`,
          total: rows.length,
        };
      }

      const regional = ENTRIES.filter((entry) => entry.region === region).sort(
        (a, b) =>
          a.data.countryName.localeCompare(b.data.countryName) ||
          a.label.localeCompare(b.label),
      );

      return {
        rows: regional.slice(0, 120).map((entry) => ({ entry, title: entry.label })),
        status: `${region} · ${regional.length} zone${regional.length === 1 ? "" : "s"}`,
        total: regional.length,
      };
    }

    const found = [];

    ENTRIES.forEach((entry) => {
      if (region !== "all" && entry.region !== region) return;
      const match = matchEntry(entry, normalizedQuery);
      if (match) found.push({ entry, ...match });
    });

    found.sort(
      (a, b) =>
        a.score - b.score ||
        Number(Boolean(b.primary)) - Number(Boolean(a.primary)) ||
        a.title.localeCompare(b.title) ||
        a.entry.label.localeCompare(b.entry.label) ||
        a.entry.data.countryName.localeCompare(b.entry.data.countryName),
    );

    const shown = found.slice(0, 80);

    return {
      rows: shown.map((match) => ({ entry: match.entry, title: match.title })),
      status: found.length
        ? `${found.length} match${found.length === 1 ? "" : "es"}${
            found.length > 80 ? " · showing 80" : ""
          }`
        : "No matches",
      total: found.length,
    };
  }

  function highlightHTML(text, query) {
    const trimmed = String(query || "").trim();
    if (!trimmed) return escapeHTML(text);

    const lower = String(text).toLocaleLowerCase();
    const needle = trimmed.toLocaleLowerCase();
    const index = lower.indexOf(needle);

    if (index === -1) return escapeHTML(text);

    return (
      escapeHTML(String(text).slice(0, index)) +
      "<mark>" +
      escapeHTML(String(text).slice(index, index + needle.length)) +
      "</mark>" +
      escapeHTML(String(text).slice(index + needle.length))
    );
  }

  function renderPicker() {
    const query = pickerSearch.value;
    const { rows, status } = findMatches(query, pickerRegion);
    const fragment = document.createDocumentFragment();

    pickerResults.innerHTML = "";

    rows.forEach(({ entry, title }) => {
      const existing = selection.find((item) => item.zone === entry.data.name);
      const isSelected = Boolean(existing);
      const row = document.createElement("button");

      row.type = "button";
      row.className = "result";
      row.dataset.zone = entry.data.name;
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", String(isSelected));

      const subtitle =
        existing && existing.label !== title
          ? `${entry.data.countryName} · in canvas as ${existing.label}`
          : `${entry.data.countryName} · ${entry.data.name.replace(/_/g, " ")}`;

      row.innerHTML = `
        <span class="result__main">
          <span class="result__city">${highlightHTML(title, query)}</span>
          <span class="result__sub">${highlightHTML(subtitle, query)}</span>
        </span>
        <span class="result__time">
          <span class="result__clock">--:--</span>
          <span class="result__zone">---</span>
        </span>
        <span class="result__action" aria-hidden="true">${isSelected ? ICON_CHECK : ICON_PLUS}</span>
      `;

      row.addEventListener("click", () => {
        const current = selection.find((item) => item.zone === entry.data.name);
        if (current) {
          closePicker();
          focusZone(entry.data.name);
          announce(announcer, `${current.label} is already on the canvas.`);
          return;
        }

        addZone(entry.data.name, title);
        if (picker.open) {
          pickerSearch.focus({ preventScroll: true });
        }
      });

      fragment.append(row);
    });

    pickerResults.append(fragment);
    pickerEmpty.hidden = rows.length !== 0;

    if (!rows.length) {
      pickerEmpty.textContent = query.trim()
        ? `No time zone matches “${query.trim()}”. Try a city, country, abbreviation or zone name.`
        : "No time zones in this region.";
    }

    pickerStatus.textContent = status;
    pickerSelectedCount.textContent = `${selection.length} selected`;
    lastPickerMinute = "";
    updatePickerTimes(new Date(), true);
  }

  function updatePickerSelection() {
    pickerSelectedCount.textContent = `${selection.length} selected`;

    pickerResults.querySelectorAll(".result").forEach((row) => {
      const isSelected = selection.some((item) => item.zone === row.dataset.zone);
      row.setAttribute("aria-selected", String(isSelected));
      const action = row.querySelector(".result__action");
      if (action) action.innerHTML = isSelected ? ICON_CHECK : ICON_PLUS;
    });
  }

  function updatePickerTimes(now = new Date(), force = false) {
    if (!picker.open) return;

    const minuteKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}-${now.getUTCHours()}-${now.getUTCMinutes()}`;
    if (!force && minuteKey === lastPickerMinute) return;
    lastPickerMinute = minuteKey;

    const localDay = localDayNumber(now);

    pickerResults.querySelectorAll(".result").forEach((row) => {
      const entry = ENTRY_BY_ZONE.get(row.dataset.zone);
      if (!entry) return;

      const parts = partsFor(entry.data.name, now);
      const offset = offsetFromParts(parts);
      const abbreviation = abbreviationFor(entry.data, offset);
      const dayOffset = dayNumberFor(entry.data.name, now) - localDay;
      const dayTag =
        dayOffset === 0 ? "" : dayOffset > 0 ? ` · +${dayOffset}d` : ` · ${dayOffset}d`;

      setText(row.querySelector(".result__clock"), `${parts.hour}:${parts.minute}`);
      setText(
        row.querySelector(".result__zone"),
        `${abbreviation} · ${formatOffset(offset)}${dayTag}`,
      );
    });
  }

  function openPicker() {
    if (picker.open) return;

    pickerRegion = "all";
    pickerSearch.value = "";
    lastPickerMinute = "";
    setActiveFilter("all");
    picker.showModal();
    renderPicker();
    window.requestAnimationFrame(() => pickerSearch.focus({ preventScroll: true }));
  }

  function closePicker() {
    if (picker.open) picker.close();
  }

  function setActiveFilter(region) {
    pickerFilters.querySelectorAll(".filter").forEach((button) => {
      const active = button.dataset.region === region;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  /* ---------------------------------------------------------------------
     Events
     --------------------------------------------------------------------- */

  addButton.addEventListener("click", openPicker);
  emptyAddButton.addEventListener("click", openPicker);
  pickerClose.addEventListener("click", closePicker);
  pickerDone.addEventListener("click", closePicker);

  picker.addEventListener("click", (event) => {
    if (event.target === picker) closePicker();
  });

  // Escape should dismiss the whole picker even while the search field holds
  // text; otherwise the browser only clears the field on the first press.
  picker.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    closePicker();
  });

  picker.addEventListener("close", () => {
    lastPickerMinute = "";
  });

  pickerSearch.addEventListener("input", renderPicker);

  pickerSearch.addEventListener("keydown", (event) => {
    if (event.isComposing) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      const first = pickerResults.querySelector(".result");
      if (first) first.focus();
      return;
    }

    if (event.key === "Enter") {
      const first = pickerResults.querySelector(".result");
      if (first) {
        event.preventDefault();
        first.click();
      }
    }
  });

  pickerFilters.addEventListener("click", (event) => {
    const button = event.target.closest(".filter");
    if (!button) return;
    pickerRegion = button.dataset.region || "all";
    setActiveFilter(pickerRegion);
    renderPicker();
  });

  pickerResults.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

    const rows = Array.from(pickerResults.querySelectorAll(".result"));
    if (!rows.length) return;

    const current = rows.indexOf(document.activeElement);
    const nextIndex =
      event.key === "ArrowDown"
        ? Math.min(current + 1, rows.length - 1)
        : Math.max(current - 1, 0);

    event.preventDefault();
    rows[Math.max(nextIndex, 0)].focus();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    renderClocks();
    views.forEach((view) => syncWeather(view));
  });

  window.addEventListener("online", () => {
    views.forEach((view) => syncWeather(view, { force: true }));
  });

  window.addEventListener("offline", () => {
    views.forEach((view) => {
      if (!view.weather.data) setWeatherError(view);
    });
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== STORAGE_KEY) return;
    selection = loadSelection();
    syncZones();
  });

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */

  function tick() {
    const now = new Date();
    renderClocks(now);
    window.setTimeout(tick, 1000 - now.getMilliseconds());
  }

  // Weather is checked independently of the one-second clock tick.
  window.setInterval(() => {
    if (document.hidden) return;
    views.forEach((view) => syncWeather(view));
  }, 60 * 1000);

  syncZones();
  tick();
})();
