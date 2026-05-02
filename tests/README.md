# Tests

Unit tests live here. **`data/concerts.json` is not modified by the suite** — copy or synthetic data is under **`tests/fixtures/`** when needed.

## Run (Jest)

From the project root:

```bash
npm install
npm test
```

Time-dependent behavior uses Jest fake timers (`jest.setSystemTime`), so results do not depend on the machine clock.

## JSON + jQuery (jsdom)

**`tests/jquery-json.test.js`** boots a minimal **`document.body`**, assigns **`jquery`** to **`window.$`**, mocks **`$.getJSON`** to resolve fixture JSON (same shapes as **`data/*.json`**), then **`require('../js/app.js')`** so the same **`$(function () { … })`** inits run. Assertions cover the tour **`<tbody>`**, members **`.members-card-col`**, preview **iframe** / track buttons, and registration **`#reg-concert`** options.

## Concert time module

**`js/concert-time.js`** defines **`formatConcertDateTime`** and **`isConcertRegistrationClosed`**. The site loads it before **`js/app.js`**; Jest **`require`**s the same file (UMD exposes **`module.exports`** in Node).
