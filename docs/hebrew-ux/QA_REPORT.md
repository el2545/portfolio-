# Hebrew RTL follow-up QA report

## Historical checks reported by the previous Copilot session (2026-11-17)

- `npm test`: 8/8 passing (before this follow-up).
- `npm run validate`: passed (before this follow-up).
- Chromium screenshot capture at 320, 375, 390, 768, 1024 and 1440 px, with no recorded horizontal overflow.
- Mobile menu opened at 375px without detected overflow.
- Google Fonts was blocked in that test browser; system fallback fonts were used.

**These results were reported by an earlier agent, not reproduced by this follow-up.**

## Current follow-up changes

- Unique canonical-link validation replaces a substring check.
- Six isolated validator scenarios were added and registered in `npm test`.
- CSS refinements were restored from the visible work log, with deliberately narrow selectors.

## Required execution before merge

```sh
npm ci
npm test
npm run validate
```

The new validator regression cases must pass and the existing integrity checks must remain intact.

## Additional manual/browser checks

- Inspect screenshots in `docs/hebrew-ux/screenshots/` at full size.
- Verify page navigation, PDF reader, map controls, RTL mixed scripts and keyboard focus.
- Check all six viewport widths with the production Hebrew font loaded.
- Run axe-core or an equivalent accessibility scan, then review issues manually.
- Record Lighthouse/Core Web Vitals measurements only if actually executed.

## Acceptance status

**Not signed off for merge or deployment.** Await new tests and independent visual/functional review.
