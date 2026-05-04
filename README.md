# hesamamiri.info

Personal portfolio site — single-page, vanilla HTML/CSS/JS, no build step.

## Files

- `index.html` — markup, all content lives here
- `styles.css` — design tokens, layout, component styles
- `script.js` — animations and interactive visualizations
- `favicon.svg` — site icon
- `Hesam-Amiri-CV.pdf` — drop your CV here so the "Download CV" button works

## Deploy on GitHub Pages

1. Drop these files into the root of your `hesamamiri04.github.io` (or
   custom-domain) repository.
2. Make sure the repo's **Pages** setting is "Deploy from a branch → main → /
   (root)".
3. If you use a custom domain (`hesamamiri.info`), keep your `CNAME` file in
   the repo root.
4. Don't forget to add your CV PDF as `Hesam-Amiri-CV.pdf` (same filename, or
   change the link in `index.html`).

## Local preview

Any static server works, e.g.:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Customizing

### Content

All text lives in `index.html`. The structure is:

- `header.hero` — landing block (title, lede, CTA buttons, oscilloscope)
- `section#research` — WiLab research card + interest tiles
- `section#projects` — project cards (add/remove `<article class="project">`)
- `section#playground` — three interactive demos
- `section#cv` — timeline + skills grid
- `section#contact` — contact cards

### Colors / fonts

All design tokens are at the top of `styles.css` under `:root`. The two key
accent colors are:

```css
--phos:   #7cf2b1;  /* phosphor green — primary accent */
--copper: #d99a6c;  /* copper — secondary accent (CSMA line, bit pattern) */
```

Swap these and the whole site re-themes.

### Visualizations

The four canvas/SVG demos in `script.js` are independent IIFEs. Each is
labeled with a numbered comment block. Tweak in place or remove by deleting
both the markup in `index.html` and the IIFE in `script.js`.

### Real measurements

The MAC chart and tunnel benchmarks are illustrative. To swap in real numbers:

- **MAC chart**: edit the `gen()` function in `script.js` (`§2`) — replace the
  generated arrays with your actual per-step throughput.
- **Tunnel benchmarks**: edit the `--pct` and `bench-val` values in the
  `data-id="tunnels"` article in `index.html`.

## Notes

- No analytics, no tracking, no third-party scripts at runtime. Only Google
  Fonts is loaded externally. Remove that link in `index.html` if you want
  zero external requests (and supply your own `@font-face` declarations).
- `prefers-reduced-motion` is respected — animations collapse for users who've
  asked their OS to limit them.
