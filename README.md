# Bastin Prasad — Portfolio

A static, dependency-free portfolio site: HTML, CSS and vanilla JavaScript. No build step.

## Folder structure

```
portfolio/
├── index.html                 All page content (edit text, projects, links here)
├── css/
│   └── styles.css             Design tokens at the top (colors, fonts, spacing)
├── js/
│   └── main.js                Interactions + CONTACT_CONFIG + SHOW_PLACEHOLDER_HINTS
├── assets/
│   ├── img/
│   │   ├── favicon.svg
│   │   ├── og-image.png       Social share preview (1200×630)
│   │   ├── profile-placeholder.svg
│   │   └── projects/          Put project screenshots here
│   └── resume/
│       └── (Bastin-Prasad-Resume.pdf goes here)
└── README.md
```

## Run locally

Open `index.html` directly in a browser, or (recommended, so every feature behaves as it will online) serve the folder:

```bash
# Python
python -m http.server 8080
# or Node
npx serve .
```

Then visit http://localhost:8080.

## What to replace

Every spot is marked with `✏️` in the code. Search for it.

| Item | Where |
|---|---|
| Profile photo | `assets/img/profile.jpg` (portrait, about 960×1120). If the file is missing, the placeholder shows instead. |
| Resume | Add `assets/resume/Bastin-Prasad-Resume.pdf`. If it's missing on the live site, the button shows a "not available yet" message instead of a broken download. |
| GitHub URL | Set to github.com/Bastin3589 in the Contact list, footer and structured data in `index.html`. |
| LinkedIn URL | Contact list and footer in `index.html` (already set). |
| Project links | Each project card in `index.html`; the comment above the grid shows the exact markup for GitHub / Live demo buttons. |
| Project screenshots | Put images in `assets/img/projects/` and add `<img class="p-shot" ...>` as the first element of a card. |
| Placeholder projects | Cards with `class="... is-placeholder"`. Fill them in, remove that class, and set `SHOW_PLACEHOLDER_HINTS = false` in `js/main.js`. Delete any card you don't need. |
| Skill descriptions | The `data-note` text on each skill button in `index.html`. These are short drafts; check they match how you actually used each tool. |
| Contact form | `CONTACT_CONFIG` at the top of `js/main.js` (see below). |
| Site URL / social preview | `canonical`, `og:url` and `og:image` in the `<head>` of `index.html`. |

## Contact form setup

The form is set up with Formspree (`https://formspree.io/f/xyezzywd`). With `provider: 'mailto'` instead, the form validates input and opens the visitor's email app with the message pre-filled. No setup needed.

To receive messages directly (without opening the visitor's email app), **pick just one** of these options. They are alternatives, not steps; you don't need all three, and you can skip them entirely if the default mailto behavior is enough:

- **Formspree**: create a form at formspree.io, then set `provider: 'formspree'` and `endpoint: 'https://formspree.io/f/YOUR_ID'`.
- **Web3Forms**: get an access key at web3forms.com, then set `provider: 'web3forms'`, `endpoint: 'https://api.web3forms.com/submit'`, `accessKey: 'YOUR_KEY'`.
- **Your own API** (e.g. an ASP.NET Core minimal API): set `provider: 'custom'` and `endpoint` to your URL. It receives JSON `{ name, email, subject, message }` and should return a 2xx status. Enable CORS for your site's domain.

## Deploy

### GitHub Pages
1. Create a repo (e.g. `bastinprasad.github.io` for a root URL, or any name).
2. Push the contents of this folder to the `main` branch (`index.html` at the repo root).
3. Repo → Settings → Pages → Source: *Deploy from a branch* → `main` / `root` → Save.
4. Your site appears at `https://USERNAME.github.io/` (or `/REPO-NAME/`). Update the canonical and `og:` URLs.

### Netlify
Drag the folder onto app.netlify.com/drop, or connect the GitHub repo with build command empty and publish directory `.`.

### Vercel
`npx vercel` in this folder, or import the GitHub repo at vercel.com/new. Framework preset: *Other*, no build command, output directory `.`.

## Motion and interaction

All scroll-linked effects run from one `requestAnimationFrame` loop in `js/main.js` (search for "Main loop" and "Scroll-linked updates"). They are only enabled when the visitor hasn't asked for reduced motion; otherwise the page shows everything statically.

| Effect | Where it lives |
|---|---|
| Hero entrance, pipeline path drawing itself, nodes popping in | `.motion .flow-wire`, `.motion .fn` in `styles.css` |
| Hero parallax and 3D tilt toward the cursor | "Hero parallax" and "Hero stage" in `main.js` |
| "Software Engineer" decode effect (replays on hover) | `scramble()` in `main.js` |
| Marquee that speeds up, skews and reverses with your scroll | `.marquee` HTML after the hero; "Marquee" in `main.js` |
| Headings revealed word by word | every `.h2`, automatically |
| About text lighting up as you read | `.prose.scrub` |
| Staggered card entrances | any container with class `stagger` |
| LIS architecture diagram powering on node by node | "Architecture diagram" in `main.js` |
| Experience timeline filling as you scroll | `.motion .timeline::after` |
| Pinned "How I think about software" sequence (click a word to jump to it) | `.is-pinned` rules; "Philosophy sequence" in `main.js` |
| 3D tilt + glow on project and certification cards | `.tilt` |
| Magnetic buttons | add class `magnetic` to any button or link |
| Cursor follower and section rail (desktop only) | `.cursor`, `.rail` |

To tone anything down, adjust the multipliers in `main.js` (e.g. `y * 0.22` for hero parallax, `* 7` / `* 9` for card tilt, `speed` on each marquee row in `index.html`).

## Notes

- Dark theme by default; the sun/moon button switches to light and remembers the choice.
- Animations respect `prefers-reduced-motion`.
- Fonts load from Google Fonts (Bricolage Grotesque, IBM Plex Sans, IBM Plex Mono) with system fallbacks.
- The hero "trace" lines are illustrative examples of the kinds of traffic the pipeline represents, not real system data.
