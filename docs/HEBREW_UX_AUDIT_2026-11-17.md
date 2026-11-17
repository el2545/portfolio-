# Hebrew-first UX audit

## Scope

The Hebrew page (`he.html`) is a native `lang="he" dir="rtl"` document sharing the site's component system with the English, French, and Arabic pages. The audit covers bidirectional content, navigation, responsive layout, forms, tables, focus treatment, and public validation.

## Implemented

- Hebrew typography uses a Hebrew-specific stack and rhythm instead of inheriting Arabic defaults.
- Navigation, hero content, section headings, project cards, tables, and forms retain RTL geometry.
- Latin labels, degree abbreviations, dates, email addresses, phone numbers, URLs, numeric inputs, and tabular values are isolated as LTR runs with `bdi`, `dir="ltr"`, or CSS direction rules.
- Navigation links, project shortcuts, language controls, form controls, and action buttons retain 44px minimum touch targets.
- Focus-visible outlines remain high-contrast on both paper and navy surfaces.
- Mobile navigation uses an accessible button with `aria-expanded`, closes on Escape, and avoids horizontal overflow.
- Scrollable data tables preserve their own inline scrolling rather than clipping the page.

## Evidence

`docs/hebrew-ux/VALIDATION.md` records the browser widths, overflow measurements, mobile-menu interaction, and the external-font limitation. Screenshots are stored under `docs/hebrew-ux/screenshots/`.

## Remaining limitations

- Hebrew font loading depends on Google Fonts in production; the browser validation environment blocked that external request, so system fallbacks were also tested.
- The interactive map and PDF reader require JavaScript and their external/runtime data paths were not exhaustively exercised at every viewport.
- No claim is made that the portfolio is a complete Hebrew localization of third-party map or PDF-renderer UI.
