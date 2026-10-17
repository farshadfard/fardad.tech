# fardad.tech

Personal portfolio of **Fardad DanaeeFard**, a bioinformatician and medical geneticist.

It is a static site (HTML, CSS and vanilla JS) with no build step and no dependencies beyond Google Fonts.

| File | Purpose |
| --- | --- |
| `index.html` | Content and structure |
| `styles.css` | Design tokens, layout and animations |
| `main.js` | DNA helix canvas, pipeline DAG and terminal, scroll reveals, counters, heatmap |
| `404.html` | Custom "deletion detected" not-found page |
| `_headers` | Cloudflare Pages security and cache headers |
| `CNAME` | Custom domain for GitHub Pages only (Cloudflare ignores it) |

## Run locally

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy on Cloudflare Pages (recommended)

### Option A: connect the GitHub repo (auto-deploys on every push)

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git**.
2. Select `farshadfard/fardad.tech` and use these settings:

   | Setting | Value |
   | --- | --- |
   | Production branch | `main` (or whichever branch holds the site) |
   | Framework preset | None |
   | Build command | *(leave empty)* |
   | Build output directory | `/` |

3. Click **Save and Deploy**. The site goes live at `https://<project>.pages.dev`.

### Option B: direct upload, without Git

```sh
npx wrangler pages deploy . --project-name=fardad-tech
```

### Custom domain

1. In the Pages project, open **Custom domains → Set up a custom domain** and add `fardad.tech`.
   Add `www.fardad.tech` too if you want it.
2. If the domain's DNS is on Cloudflare, the records and SSL certificate are set up automatically.
   Otherwise, either change the domain's nameservers at your registrar to the ones Cloudflare gives you (simplest),
   or add the CNAME record Cloudflare shows you.
3. Optional: send `www` to the apex domain with **Rules → Redirect Rules → "Redirect from WWW to root"**.

### What `_headers` does

- **Security:** sets HSTS, `nosniff`, clickjacking protection, a strict Referrer-Policy and Permissions-Policy, and a
  Content-Security-Policy that allows only this site, Google Fonts and Cloudflare Web Analytics.
- **Caching:** HTML always revalidates, so a new deploy shows up immediately. CSS and JS are cached for 1 hour
  (their filenames aren't fingerprinted). Assets under `/assets/` are cached for 1 week.

If you add a third-party script, embed or font later, add its domain to the `Content-Security-Policy` line,
or the browser will block it.

## Alternative: GitHub Pages

In **Settings → Pages**, choose *Deploy from a branch* and pick the branch and `/ (root)`. The `CNAME` file sets the domain.
Use only one host for `fardad.tech`, either Cloudflare or GitHub Pages, not both.
