# Hebrew RTL follow-up QA report

## Historical checks reported by the previous Copilot session (2026-11-17)

- `npm test`: 8/8 passing (before this follow-up).
- `npm run validate`: passed (before this follow-up).
- Chromium screenshot capture at 320, 375, 390, 768, 1024 and 1440 px, with no recorded horizontal overflow.
- Mobile menu opened at 375px without detected overflow.
- Google Fonts was blocked in that test browser; system fallback fonts were used.

**These results were reported by an earlier agent, not reproduced by this follow-up.**

## Verified GitHub Actions execution (2026-11-17)

- Workflow: `Hebrew RTL quality checks`, run [#44201371058](https://github.com/el2545/portfolio-/actions/runs/44201371058).
- Commit tested: `69bb4435feb9916d193cd7e328d7cdc9e4d5080c`.
- `npm ci --ignore-scripts`: passed.
- `npm test`: **14 passed, 0 failed**, including all six positive/negative validator scenarios.
- `npm run validate`: **passed**.
- Test run used Ubuntu/Node 22 and GitHub Actions checkout. It did **not** run browsers, Lighthouse, axe-core, or screen readers.

These results are directly observable in the CI logs. Future code commits must be tested again.

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

CI has now run the validator regression cases successfully. Any subsequent changes must pass the same checks again.

## Additional manual/browser checks

- Inspect screenshots in `docs/hebrew-ux/screenshots/` at full size.
- Verify page navigation, PDF reader, map controls, RTL mixed scripts and keyboard focus.
- Check all six viewport widths with the production Hebrew font loaded.
- Run axe-core or an equivalent accessibility scan, then review issues manually.
- Record Lighthouse/Core Web Vitals measurements only if actually executed.

## Acceptance status

**Automated checks passed on the cited commit. Not signed off for merge or deployment:** independent visual/functional review and native-Hebrew/assistive-technology checks remain outstanding.
