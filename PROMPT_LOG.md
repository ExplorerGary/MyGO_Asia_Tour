# Prompt Log

This file tracks each prompt you provide and what we accomplished in response.

---

## 2026-04-30

### Prompt
I want to build a website site. We will build this incrementally. To start, create a PROMPT_LOG.md file. After every prompt I give you, update that file with the prompt text and a brief explanation of what we achieved. Remember to include this propmt as well

### Outcome
Created `PROMPT_LOG.md` and added the initial entry for this prompt. Going forward, after each new prompt you send, I will append a new entry with your prompt text and a brief summary of what we achieved.

---

### Prompt
also, create a FEATURES.md file. Every time we finish a component, update that file with a checkmark and a brief description of how it works.

### Outcome
Added support for a `FEATURES.md` checklist: we will track completed components with checkmarks and a short description of how each works. Created the initial `FEATURES.md` file.

---

### Prompt
since our website has lots of Features, I guess we need to run some tests on it. prepare a dir named tests/ 
this is the place where we put the unit tests as well as results in it

### Outcome
Prepared a `tests/` folder location for future unit tests and test result artifacts, and ensured it is tracked in the repo via an initial file.

---

### Prompt
OK, our project will be a static webpage, with bootstrap and jquery.
so: create dirs named: js(to put the jquery scripts) data: to put the json files (we might need them in jquery for dynamic contents), all other dirs like image, video, audio, etc.

prepare the basic setup for this page

finally, turn the index.html into a boiler page, prime the bootstrap and jquery, remember to prime bootstrap icons as well

### Outcome
Created the starter static-site folder structure (`js/`, `data/`, `image/`, `video/`, `audio/`, plus `css/`) with initial placeholder/starter files, and replaced `index.html` with a Bootstrap + jQuery boilerplate that also loads Bootstrap Icons and points to the local `css/styles.css` and `js/app.js`.

---

### Prompt
well, you deleted index.html, please add it back

### Outcome
Restored `index.html` as the Bootstrap + jQuery + Bootstrap Icons boilerplate page.

---

## 2026-05-01

### Prompt
OK, before we start:
See that PROMPT_LOG.md file? After every prompt I give you, update that file with the prompt text and a brief explanation of what we achieved.
Also every time we finish a component, update that file with a checkmark and a brief description of how it works, put it into the FEATURES.md

### Outcome
Confirmed the standing workflow: append each new user prompt and its outcome to `PROMPT_LOG.md`; when a component is completed, add a checked item to `FEATURES.md` with a short description of how it works. Logged this prompt and refreshed the plan—no new UI components were built in this step.

---

### Prompt
OK, lets clear the body part of our index.html

I will tell you the basic structure of our page (namely how many rows) be aware this is not feature!
1. the first row will be responsive nav bar
2. the second row will be a hero page, really large one, be sure to make it col12
3. the thrid row will be a map (col-md-6) and a table for a tour date list
4. the forth row will be member introduction for the band, make it col-12
5. the fifth row will be used as audio previewer. we will have two parts, a video iframe col-6, and a list of available try out songs, col-6
6. finally we will have a row for registeration for the live, col-12

you shall set up the skelton of our website. Then I will instruct you to fill the first component.

make sure to give unique ID to each row, we will use them in the nav bar system

### Outcome
Cleared the previous boilerplate content from `<body>`. Built a six-section skeleton with Bootstrap grid: sticky responsive navbar (`#row-nav`) linking to `#row-hero` (large full-width hero, `col-12`, ~75vh via CSS), `#row-tour` (map placeholder + striped tour table, `col-md-6` each), `#row-members` (`col-12`), `#row-preview` (16×9 video area + song list, `col-md-6` each), and `#row-register` (`col-12`). Removed the old jQuery “ping” demo script; page title set to the tour name. This is structure only—not counted as a completed “feature” in `FEATURES.md`.

---

### Prompt
OK, greeat work, now let's finish the first functiion: the nav bar.
1. `<a class="navbar-brand" href="#row-hero">MyGo!!!!!</a>` please replace it with the new @image/MyGO_Logo.png in the image dir.
"hero" tab is deleted as it is duplicated with the logo.
Also, I renamed these tabs, making them more attractive
Finally, make our Ignite the Beat a drop down menu, where user can just select the songs to preview, we will setup a json and jquery for this. But now, we just leave a place holder for them

That concludes the nav bar

### Outcome
Replaced text brand with `image/MyGO_Logo.png` (copied into `image/`), added responsive logo sizing in `css/styles.css`, removed the redundant Hero nav link, kept the renamed links (and fixed the broken `Asia Tour 2026` anchor tag). Converted **Ignite the Beat** into a Bootstrap dropdown with `#js-nav-song-list` for future JSON/jQuery wiring, placeholder messaging, and an **Open preview player** item targeting `#row-preview`. Documented the completed navbar as the first checked feature in `FEATURES.md`.

---

### Prompt
OK, great, now lets complete the next part: the hero.
that image should be the @image/key_visual.webp in the image dir.

that concludes the hero image function. But later we will add more feature to it.

### Outcome
Replaced the hero placeholder with `image/key_visual.webp` in `#row-hero` (full-width `col-12`), using `.hero-key-visual` / `.hero-key-visual-img` styles for a large (~75vh) full-bleed image with `object-fit: cover` and a black background fallback. Logged the hero image as a completed feature in `FEATURES.md` with notes that additional hero behaviors can be layered on later.

