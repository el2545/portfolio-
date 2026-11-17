# Elghali Sany — Academic Portfolio

Multilingual academic and professional portfolio focused on **economics, finance, data analysis, investment appraisal and applied mobility analysis**.

**Live site:** https://el2545.github.io/portfolio_UAE/

## Languages

- English — `index.html`
- French — `fr.html`
- Arabic — `ar.html`
- Hebrew — `he.html`

Arabic and Hebrew interfaces use native RTL handling rather than a blanket horizontal mirror. The Hebrew version includes dedicated typography and bidirectional-text adjustments.

## Main features

- Multilingual static portfolio with EN / FR / AR / HE navigation.
- Responsive, keyboard-accessible interface.
- Integrated PDF reader based on bundled PDF.js runtime assets.
- Interactive Casablanca traffic / SUMO replay and heatmap explorer.
- OOH / DOOH investment scenario tools and panel-workshop model.
- Academic CVs and project documents available directly from the site.
- No application server, database, analytics SDK or build step is required for the public site.

## Repository structure

The site is intentionally deployed from the repository root because GitHub Pages expects the entry file at the top level of the selected publishing source.

```text
.
├── index.html              # English entry page
├── fr.html                 # French
├── ar.html                 # Arabic / RTL
├── he.html                 # Hebrew / RTL
├── styles.css              # Shared UI and responsive styling
├── app.js                  # Main interactive application
├── locale.js / i18n.js     # Localisation logic
├── advertising*.js         # OOH/DOOH analytical modules
├── *_traffic_*.json        # Streamed SUMO replay chunks
├── *_roads.json            # Road-network exports
├── *_heatmap.json          # Density exports
├── pdf*.mjs / pdf-reader.js
├── docs/                   # Audit and historical technical notes
├── scripts/validate-repo.mjs
└── .github/workflows/      # GitHub Pages deployment
```

## Run locally

Do **not** open the HTML files directly with `file://`; the traffic and document modules use HTTP fetches.

With Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

With Node.js, any static HTTP server is also suitable.

## Validation

Run the repository safety/integrity check:

```bash
node scripts/validate-repo.mjs
```

The validator checks the required Pages entry files, local HTML asset references, canonical Pages URLs and GitHub's 100 MiB single-file ceiling.

The project also contains domain-specific Node test files inherited from the analytical modules. See `docs/TECHNICAL_HISTORY.md` for their historical validation scope and limitations.

## GitHub Pages deployment

A GitHub Actions workflow is included at `.github/workflows/pages.yml`.

1. Create or use the repository `portfolio_UAE`.
2. Push these files to the default branch, normally `main`.
3. In **Settings → Pages → Build and deployment**, choose **GitHub Actions** as the source.
4. Push to `main` or run the workflow manually.

The workflow validates the repository, packages the static site and deploys it to GitHub Pages.

The canonical URLs, `robots.txt` and `sitemap.xml` currently target:

```text
https://el2545.github.io/portfolio_UAE/
```

If the repository name or owner changes, update those URLs before deployment.

## Large data note

The repository contains substantial simulation datasets. They are kept because they power the interactive traffic replay. GitHub Pages currently recommends source repositories and published sites remain below 1 GB; individual regular Git objects are limited to 100 MiB. This repository is designed to remain below those thresholds, but future data additions should be checked with `node scripts/validate-repo.mjs` before pushing.

## Documentation

- `docs/HEBREW_UX_AUDIT_2026-11-17.md` — Hebrew / RTL UX audit.
- `docs/TECHNICAL_HISTORY.md` — detailed historical implementation notes.
- `docs/DATA_REVIEW.md` — data-source review notes.
- `docs/REVIEW.md` — earlier review notes.
- `docs/RELEASE_NOTES*.md` — historical releases.
- `THIRD_PARTY_LICENSES.txt` and related files — bundled third-party notices.

## License

Copyright © 2026 El Ghali Sany.

Original portfolio code, copy and visual design are **all rights reserved** unless a file states otherwise. Bundled third-party software retains its own licence terms. See `LICENSE` and `THIRD_PARTY_LICENSES.txt`.
