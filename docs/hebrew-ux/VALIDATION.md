# Hebrew RTL validation

Validation date: 2026-11-17

## Repository checks

- `npm test`: 11 tests passed, 0 failed.
- `npm run validate`: passed.
- The validator verifies the required Pages entry files, `<html lang>/<html dir>` combinations, canonical URLs, local assets, public preserved-asset hashes, and GitHub's 100 MiB file ceiling.
- Negative validator tests cover invalid RTL direction, missing local assets, and incorrect canonical URLs.

## Browser checks

The Hebrew page was tested with a local HTTP server in Chromium at:

- 320px
- 375px
- 390px
- 768px
- 1024px
- 1440px

At every width, `document.documentElement.scrollWidth` matched the viewport width and no horizontal overflow was detected. The page remained `lang="he" dir="rtl"`.

The mobile navigation was opened at 375px. It reported `aria-expanded="true"`, opened as a grid menu, and introduced no horizontal overflow.

The mobile menu button also exposed a 3px visible focus outline with a 4px offset. No clipping, collapsed controls, or reversed mixed-language runs were visible in the six saved screenshots.

Screenshots:

- `screenshots/he-320.png`
- `screenshots/he-375.png`
- `screenshots/he-390.png`
- `screenshots/he-768.png`
- `screenshots/he-1024.png`
- `screenshots/he-1440.png`

## External asset limitation

The browser console reported that Google's Cormorant and Noto Sans Hebrew stylesheet was blocked by the browser environment. The page still rendered with local/system font fallbacks and no layout overflow.
