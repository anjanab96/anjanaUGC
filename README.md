# Anjana Bala — UGC portfolio

Hand-built replacement for the Canva site. Plain HTML/CSS/JS, no build step.

- `index.html` — content and structure
- `styles.css` — layout, breakpoints (600 / 700 / 800 / 900 / 1100px), colors at the top under `:root`
- `main.js` — scroll motion (reveals, parallax, pinned video row, nav)
- `assets/img/` — photos

## Run locally

```bash
python3 -m http.server 5173
```

Then open http://localhost:5173.

## Editing tips

- **Swap a video:** change the `data-tiktok="<video id>"` on a `.vcard__frame` (the ID is the number at the end of the TikTok URL).
- **Gallery speed:** each `.gallery__col` has `data-speed` — bigger numbers drift more, negative goes the other way.
- **Parallax amount:** `data-parallax` on the hero and about images.
- **Pinned video scroll speed:** `PIN_SLOW` in `main.js`.
- Motion turns off automatically for visitors with "reduce motion" enabled.

## Deploy

Works as-is on GitHub Pages (Settings → Pages → deploy from `main`), Netlify, or Vercel.
