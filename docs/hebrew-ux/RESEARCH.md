# Hebrew RTL research and evidence boundaries

## Technical standards consulted by the original workstream

- [W3C — Structural markup and text direction](https://www.w3.org/International/questions/qa-html-dir)
- [Unicode Standard Annex #9 — Bidirectional Algorithm](https://www.unicode.org/reports/tr9/)
- [W3C — WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [MDN — CSS logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values)

These are reference sources for implementation decisions, **not evidence of an externally performed user study or complete WCAG audit**.

## Repository-grounded observations

- `he.html` declares `lang="he"` and `dir="rtl"`.
- The page contains Hebrew metadata, canonical URL, language alternates and a Hebrew font request.
- `styles.css` already contained several Hebrew-specific declarations and logical CSS properties.
- The supplemental style pass is intentionally scoped to `html[lang="he"]`, avoiding regression to English, French and Arabic pages.

## Design choices

- Preserve the site's existing navy, paper and rust identity.
- Continue using Noto Sans Hebrew where available and explicit system fallbacks.
- Isolate contact identifiers and true LTR data, not every number or mixed-language sentence.
- Use logical inline/block properties, not a blanket horizontal flip.

## Unavailable evidence

A ten-site Israeli benchmark, native-Hebrew linguistic validation, controlled user study, browser-based screen-reader evaluation, and Core Web Vitals measurements have **not** been completed for this follow-up. Do not infer these from existing documentation.
