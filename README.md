# fardad.tech

Personal portfolio of **Fardad DanaeeFard**, a bioinformatician and medical geneticist.

It is a static site (HTML, CSS and vanilla JS) with no build step and no dependencies beyond Google Fonts.

- `index.html` holds the content and structure
- `styles.css` holds the design tokens, layout and animations
- `main.js` runs the DNA helix canvas, the pipeline DAG and terminal, scroll reveals, counters and the heatmap
- `CNAME` sets the custom domain for GitHub Pages

## Run locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy

In **Settings → Pages**, choose *Deploy from a branch*, then pick the branch and `/ (root)`.
Point the `fardad.tech` DNS at GitHub Pages: four `A` records for the apex, or a `CNAME` for `www`.
