# Features

MyGo!!!!! Asia Tour promo page — completed components are listed below with a checkmark and how each works.

## Components

- [x] **Responsive navigation bar (`#row-nav`)** — Sticky dark navbar with the official MyGO!!!!! logo image (`image/MyGO_Logo.png`) as the brand control linking to `#row-hero` (replacing the duplicate “Hero” tab). Links use the updated labels (Asia Tour 2026, Members Spotlight, Secure Your Dream Ticket). **Ignite the Beat** is a Bootstrap dropdown (`#navIgniteBeat` → `#js-nav-song-list`) with placeholder copy for future JSON-driven song previews plus a menu item to jump to `#row-preview`.

- [x] **Hero key visual (`#row-hero`)** — **Final:** Full-width `col-12` hero shows `image/key_visual.webp` (**1000×400** px, wide banner). The wrapper uses **`aspect-ratio: 1000 / 400`**, so hero height tracks viewport width (no fixed **vh** that fought the new art). The `<img>` is absolutely positioned and **`object-fit: fill`** inside that box (same aspect as the file → no skew). **`width` / `height`** on the tag match the file for layout stability. Black fallback behind the block; overlays/interactions can be added later.

- [x] **Footer (`site-footer`)** — Dark footer with **`mt-auto`** so it sits at the bottom of the page flex column. Inside one wrapper **`.site-footer-content`**: **row 1** is a centered nav of four Bootstrap Icons (`twitter-x`, `facebook`, `instagram`, `tiktok`) linking to the official BanG Dream accounts with **`target="_blank"`** and **`rel="noopener noreferrer"`**; **row 2** is the fictional-site / educational disclaimer plus © notices. Icons use **`aria-label`** on links for accessibility.

- [x] **Asia tour map (`#tour-map`)** — Leaflet with OpenStreetMap tiles, five stops in order (Tokyo → Singapore) with shared **Bootstrap Icon** `bi-star-fill` **`divIcon`** markers, **`fitBounds`** over Asia. Initialized from **`initTourMap()`** in **`js/app.js`**.

- [x] **Tour dates table (`#tour-dates-tbody`)** — Rows built by **`initConcertsTable()`**: **`$.getJSON('data/concerts.json')`** then append `<tr>` cells for date/time, city, venue. Each concert uses **`startsAt`** as **ISO 8601 with UTC offset** plus **`timeZone`** (IANA); **`formatConcertDateTime`** uses **`Intl.DateTimeFormat`** (`en-US`, **`dateStyle: full`**, **`timeStyle: short`**) so shown times are correct **local civil time** for that city. Loading / error states handled in the tbody.

- [x] **Members (`#row-members` / `#members-root`)** — **`data/characters.json`** lists each character with **`name`**, **`position`**, **`img_front`**, **`img_end`** (paths paired to **`tmr` / `anon` / `rana` / `soyo` / `taki`** files in **`image/`**). **`initMembersSection()`** loads JSON and builds Bootstrap **cards** with a **3D flip** (front vs back art): **hover** on fine pointers, **tap** to toggle on coarse/touch, **Enter** / **Space** toggles when focused. Images use **lazy** loading; names are escaped when inserted into HTML.

