# Features

MyGo!!!!! Asia Tour promo page — completed components are listed below with a checkmark and how each works.

## Components

- [x] **Responsive navigation bar (`#row-nav`)** — Sticky dark navbar with the official MyGO!!!!! logo image (`image/MyGO_Logo.png`) as the brand control linking to `#row-hero` (replacing the duplicate “Hero” tab). Links use the updated labels (Asia Tour 2026, Members Spotlight, Secure Your Dream Ticket). **Ignite the Beat** (`#navIgniteBeat` → **`#js-nav-song-list`**) is filled by **`initSongsPreview()`** from **`data/songs.json`**: each track is a **`dropdown-item`** button that loads the same MV as the preview section; divider + **Open preview player** link to **`#row-preview`** remain.

- [x] **Hero key visual (`#row-hero`)** — **Final:** Full-width `col-12` hero shows `image/key_visual.webp` (**1000×400** px, wide banner). The wrapper uses **`aspect-ratio: 1000 / 400`**, so hero height tracks viewport width (no fixed **vh** that fought the new art). The `<img>` is absolutely positioned and **`object-fit: fill`** inside that box (same aspect as the file → no skew). **`width` / `height`** on the tag match the file for layout stability. Black fallback behind the block; overlays/interactions can be added later.

- [x] **Footer (`site-footer`)** — Dark footer with **`mt-auto`** so it sits at the bottom of the page flex column. Inside one wrapper **`.site-footer-content`**: **row 1** is a centered nav of four Bootstrap Icons (`twitter-x`, `facebook`, `instagram`, `tiktok`) linking to the official BanG Dream accounts with **`target="_blank"`** and **`rel="noopener noreferrer"`**; **row 2** is the fictional-site / educational disclaimer plus © notices. Icons use **`aria-label`** on links for accessibility.

- [x] **Asia tour map (`#tour-map`)** — Leaflet with OpenStreetMap tiles, five stops in order (Tokyo → Singapore) with shared **Bootstrap Icon** `bi-star-fill` **`divIcon`** markers, **`fitBounds`** over Asia. Initialized from **`initTourMap()`** in **`js/app.js`**.

- [x] **Tour dates table (`#tour-dates-tbody`)** — Rows built by **`initConcertsTable()`**: **`$.getJSON('data/concerts.json')`** then append `<tr>` cells for date/time, city, venue. Each concert uses **`startsAt`** as **ISO 8601 with UTC offset** plus **`timeZone`** (IANA); **`formatConcertDateTime`** uses **`Intl.DateTimeFormat`** (`en-US`, **`dateStyle: full`**, **`timeStyle: short`**) so shown times are correct **local civil time** for that city. Loading / error states handled in the tbody.

- [x] **Members (`#row-members` / `#members-root`)** — **`data/characters.json`** lists each character with **`name`**, **`position`**, **`img_front`**, **`img_end`**, **`color`** (paths paired to image files under **`image/`**). **`initMembersSection()`** sets **`--character-accent`** via **`sanitizeHexColor()`** per card (**`.character-card--themed`**): **4px** border uses that hue, plus **layered `box-shadow` drop shadows** and a **`color-mix`** glow where supported. Flip photo area uses **taller `aspect-ratio: 9 / 16`**, **`min-height: clamp(...)`**, **`object-fit: contain`**, and a tinted face background so **full body art** shows without **`cover`** cropping. **3D flip** unchanged (**hover** / **tap** / **keyboard**).

- [x] **Song / MV preview (`#row-preview`)** — **`data/songs.json`** lists **`songs`** with **`name`** (or legacy **`title`**) and **`iframe`** (full embed markup). **`initSongsPreview()`** loads JSON, **`extractYouTubeEmbedSrc()`** pulls only **`youtube.com/embed/…`** URLs, and **`buildPreviewIframe()`** injects a safe **`<iframe>`** into **`#preview-mv-host`** inside **`#preview-mv-wrap`** (**16×9**). **`#preview-song-list`** gets full-width buttons per track; **`#js-nav-song-list`** mirrors the same choices. First song loads by default; failures show a short error hint (needs HTTP, not **`file://`**).

