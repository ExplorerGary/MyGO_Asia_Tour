# Features

MyGo!!!!! Asia Tour promo page — completed components are listed below with a checkmark and how each works.

## Components

- [x] **Responsive navigation bar (`#row-nav`)** — Sticky dark navbar with the official MyGO!!!!! logo image (`image/MyGO_Logo.png`) as the brand control linking to `#row-hero` (replacing the duplicate “Hero” tab). Links use the updated labels (Asia Tour 2026, Members Spotlight, Secure Your Dream Ticket). **Ignite the Beat** is a Bootstrap dropdown (`#navIgniteBeat` → `#js-nav-song-list`) with placeholder copy for future JSON-driven song previews plus a menu item to jump to `#row-preview`.

- [x] **Hero key visual (`#row-hero`)** — **Final:** Full-width `col-12` hero shows `image/key_visual.webp` (**1000×400** px, wide banner). The wrapper uses **`aspect-ratio: 1000 / 400`**, so hero height tracks viewport width (no fixed **vh** that fought the new art). The `<img>` is absolutely positioned and **`object-fit: fill`** inside that box (same aspect as the file → no skew). **`width` / `height`** on the tag match the file for layout stability. Black fallback behind the block; overlays/interactions can be added later.

