# Features

MyGo!!!!! Asia Tour promo page — completed components are listed below with a checkmark and how each works.

## Components

- [x] **Responsive navigation bar (`#row-nav`)** — Sticky dark navbar with the official MyGO!!!!! logo image (`image/MyGO_Logo.png`) as the brand control linking to `#row-hero` (replacing the duplicate “Hero” tab). Links use the updated labels (Asia Tour 2026, Members Spotlight, Secure Your Dream Ticket). **Ignite the Beat** is a Bootstrap dropdown (`#navIgniteBeat` → `#js-nav-song-list`) with placeholder copy for future JSON-driven song previews plus a menu item to jump to `#row-preview`.

- [x] **Hero key visual (`#row-hero`)** — Full-width `col-12` hero displays `image/key_visual.webp` inside `.hero-key-visual` / `.hero-key-visual-img`. The image is sized to about **75vh** tall with **`object-fit: cover`** and centered **`object-position`** so it stays edge-to-edge and crops cleanly on different aspect ratios; section has a black fallback behind the image. Room for future overlays or interactions without changing the image path.

