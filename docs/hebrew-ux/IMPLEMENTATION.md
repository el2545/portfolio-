# Hebrew RTL follow-up implementation

## Repository context

Original pull request #1 (`feat/hebrew-rtl-validation`) was merged on 2026-11-17; it delivered repository validation, data-review documentation, manifest changes, and screenshots, but did not include the prior worktree's supplementary CSS or five UX reports.

This follow-up is developed on `fix/hebrew-rtl-completion` and must remain unmerged until reviewed.

## Source modifications

- `styles.css`: restored targeted Hebrew line rhythm, heading wrapping, select alignment, reading-width guidance, email/phone directional isolation, action target sizes, mobile navigation treatment, and dark-surface focus refinement.
- `scripts/validate-repo.mjs`: requires exactly one real `<link rel="canonical">` element with the expected href, rather than finding the URL anywhere in HTML.
- `scripts/validate-repo.test.mjs`: isolated fixture tests for valid output, invalid Hebrew direction, unrelated canonical-like links, duplicate canonical links, missing local assets and checksum mismatch.
- `package.json`: includes the validator regression suite in `npm test`.
- `docs/hebrew-ux/`: rebuilt a concise audit, research note, design system and QA handoff from the available original work log and source inspection.

## Invariants

Do not modify map data, portfolio history, academic claims, protected financial data, business logic, other languages, or deployment configuration merely for a visual correction.

## Known limitations

- The original Copilot worktree itself was not accessible from the GitHub connector; changes were reconstructed from its conversation log rather than recovered byte-for-byte.
- Browser screenshot pixels could not be independently inspected in this environment.
- A new real browser run, screen-reader test, native-Hebrew linguistic review and performance measurement remain outstanding.
- Do not treat a pre-existing successful test result as a fresh result on this branch.
