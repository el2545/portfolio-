# Hebrew-first design system notes

## Typography

| Element | Rule |
| --- | --- |
| Hebrew body | `Noto Sans Hebrew`, Arial fallback; `line-height: 1.78` |
| Hebrew H1–H3 | `line-height: 1.34`; balanced wrapping |
| Brand wordmark | Preserve `Cormorant` Latin branding |
| Forms/selects | Logical start alignment; readable line-height |
| Mixed-direction identifiers | Isolate actual LTR data using semantic markup and narrow selectors |

The font fallback remains necessary when remote font resources are blocked.

## Existing palette

- Navy: `#061b2f`
- Deep navy: `#0b2740`
- Ink: `#17202a`
- Paper: `#f4f1ea`
- Rust: `#ab421d`
- Warm accent: `#ed9470`

These preserve the repository's visual identity, not a new brand redesign.

## RTL rules

1. Declare direction at the document boundary.
2. Prefer `margin-inline-*`, `padding-inline-*` and `border-block` over physical left/right where direction matters.
3. Keep logos, maps, numeric identifiers and media content in their semantically correct direction.
4. Keep DOM, keyboard order and visual order consistent.
5. Use `bdi` and `dir="ltr"` for true LTR values when markup permits.

## Interaction

- Primary actions: minimum 48px height in the scoped Hebrew rules.
- Project navigation: minimum 44px link height.
- Hebrew mobile navigation: minimum 48px touch height.
- Dark hero / section focus: warm, visible outline color, without suppressing standard focus outlines.
- Responsive adjustments apply below 760px.

## Constraints

No unrelated global restyling, framework migration, new runtime dependencies or content rewrite is included.
