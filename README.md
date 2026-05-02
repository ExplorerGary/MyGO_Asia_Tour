# MyGO!!!!! — Asia Tour 2026

A single-page promotional experience for a fictional **MyGO!!!!!** Asia tour. The site blends **Bootstrap 5**, **jQuery**, and **Leaflet** with JSON-driven content so dates, members, setlists, and registration copy stay easy to edit without touching layout code.

---

## Vibe

Think **arena tour energy** meets **late-night band site**: deep teal and steel blue, **Russo One** headlines, a soft blurred stage backdrop, and little moments of motion—dashed route lines that “run” along the map after past shows, flip cards for each member, and a floating preview control that keeps the MV + try-out player one tap away. It is earnest, slightly loud, and built like a real promo page—just don’t mistake it for an official Bandori release.

---

## Tech stack

| Layer | Choice |
|--------|--------|
| Markup & layout | HTML5, **Bootstrap** 5.3 |
| Scripting | **jQuery** 3.x, vanilla JS in a few spots |
| Styling | Custom **`css/styles.css`** (+ Bootstrap) |
| Data | **`data/*.json`** (concerts, characters, songs) |
| Map | **Leaflet** 1.9 + OpenStreetMap tiles |
| Fonts / icons | Google Fonts (**Russo One**), **Bootstrap Icons** |
| Tests | **Jest** (Node + **jsdom** for DOM integration tests) |

---

## Getting started

### 1. Clone or copy the project

Work inside this folder so relative paths to **`data/`**, **`image/`**, **`audio/`**, and **`js/`** resolve correctly.

### 2. Serve the site over HTTP (recommended)

`index.html` loads JSON with **`$.getJSON`**. Many browsers block **`file://`** requests to local JSON, and the songs preview shows an error if the fetch fails—so use a small static server:

**VS Code / Cursor — Live Server**

- Install the **Live Server** extension.
- Right-click **`index.html`** → **Open with Live Server**.

**Python 3**

```bash
cd path/to/EXTRA_02_VIBE_CODING
python -m http.server 8080
```

Then open **http://localhost:8080/** and click through to **`index.html`** if your server lists the directory.

**Node (npx)**

```bash
cd path/to/EXTRA_02_VIBE_CODING
npx --yes serve .
```

Pick the URL the tool prints (often **http://localhost:3000**).

### 3. Open in the browser

Navigate to **`index.html`** on that origin. You should see the hero, map, tables, members, works preview, and lottery form with live data from **`data/`**.

### Optional: run unit tests

Requires [Node.js](https://nodejs.org/) (includes **npm**):

```bash
npm install
npm test
```

---

## Project layout

```
EXTRA_02_VIBE_CODING/
├── index.html          # Main page
├── css/styles.css      # Site + component styles
├── js/
│   ├── app.js          # jQuery inits, map, tables, preview, lottery
│   └── concert-time.js # Shared date/closed helpers (UMD; used by tests)
├── data/
│   ├── concerts.json   # Tour stops + ISO datetimes + IANA time zones
│   ├── characters.json # Member cards (names, roles, images, accent hex)
│   └── songs.json      # MV iframes + MP3 paths for preview
├── image/ audio/ video/ # Assets (see repo)
├── tests/              # Jest specs + fixtures
├── FEATURES.md         # Detailed component + decoration checklist
└── README.md           # This file
```

---

## Feature list

### Core experience

- **Sticky navbar** — Logo to hero; anchors for tour, members, and lottery; **Ignite the Beat** dropdown synced with the works preview track list (`data/songs.json`).
- **Hero** — Wide **key visual** banner with a fixed aspect ratio so art scales cleanly across viewports.
- **Asia tour map** — Five cities (Tokyo → Singapore) with star markers, bounds fit to the region, and dashed **SVG** legs between stops; legs **animate** in the accent color once the *previous* city’s show has started (per `data/concerts.json` + shared “closed” time logic).
- **Tour dates table** — Loaded from **`data/concerts.json`**; each row shows **local date/time** in the venue’s time zone (`Intl.DateTimeFormat`). Rows link to map markers (hover highlight, click to stick/unstick).
- **Members spotlight** — Cards from **`data/characters.json`** with per-character accent borders, **3D flip** (hover / tap / keyboard), and **responsive** behavior: below `md`, a name tablist shows **one** card at a time with **Tomori** as the default pick.
- **Works preview** — MV (**YouTube embed**) + MP3 try-out from **`data/songs.json`**; list + nav share indices; floating play/pause control; transparent overlay pauses audio without blocking the video when audio is idle. **Responsive:** MV and try-out **stack** on small screens, **side-by-side** from `md` up.
- **Lottery registration** — Styled form with concert select (same JSON + local-time labels as the table), tier/tickets/payment controls, validation, and a **simulated** submit (opens a placeholder link). Past shows appear **disabled** with an “ended” label.
- **Footer** — Social links, ©-style copy, and simulation disclaimer.

### Supporting behavior

- **Concert time helpers** (`js/concert-time.js`) — `formatConcertDateTime`, `isConcertRegistrationClosed`; used by the table, map route styling, and registration UI.
- **Unit tests** — `tests/concert-time.test.js` (pure time logic); `tests/jquery-json.test.js` (jsdom + mocked `$.getJSON` against fixtures). See **`tests/README.md`**.

### Visual layer (decoration)

- Fixed **blurred** full-page backdrop, tokenized **main / accent** palette, navbar and card chrome, stadium graphic treatment for registration, reduced-motion variants where it matters. Full detail lives in **`FEATURES.md`** under **Decoration**.

---

## Editing content

| File | Purpose |
|------|---------|
| `data/concerts.json` | `startsAt` (ISO with offset), `timeZone` (IANA), `location`, `venue` |
| `data/characters.json` | `name`, `position`, `img_front`, `img_end`, `color` (`#RGB` / `#RRGGBB`) |
| `data/songs.json` | `name`, `iframe` (YouTube embed only), `audio` (relative MP3 path) |

After edits, refresh the browser (hard refresh if assets are cached).

---

## License / disclaimer

This repository is a **student / fan-made** layout exercise. **MyGO!!!!!** and related names and imagery are properties of their respective rights holders; this project is not affiliated with or endorsed by them. Use assets and JSON only in line with your course and local fair-use norms.
