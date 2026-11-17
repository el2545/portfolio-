# Hebrew RTL design-system notes

## Direction rules

The document root owns the reading direction. Inline content that must preserve its own ordering uses semantic isolation:

```html
<bdi dir="ltr">MSc 1</bdi>
<a class="di-email" dir="ltr">sanyghali@gmail.com</a>
```

Use `dir="ltr"` for identifiers, dates, phone numbers, URLs, email addresses, file formats, and numeric controls. Do not reverse directional icons with text-only glyph hacks; use the existing mirrored control rules for sequential navigation.

## Typography

Hebrew uses `Noto Sans Hebrew` with Arial fallback, a 1.72 body line-height, tighter heading rhythm, and no forced Latin letter-spacing. Display branding remains Latin and isolated.

## Components

- Navigation and language controls: 44px minimum interactive area.
- Tables: `text-align: start`, tabular numerals, and inline scrolling when needed.
- Forms: LTR numeric/email/url inputs, visible `:focus-visible` outlines, and full-width controls on narrow screens.
- Mixed-language cards: isolate short Latin runs instead of relying on browser heuristics.
- Mobile menu: disclosure button with `aria-controls` and `aria-expanded`.

## Validation contract

The repository validator checks canonical link elements by parsing their attributes, not by searching for a particular quote style or attribute order. Negative tests cover invalid RTL direction, missing local assets, and incorrect canonical URLs.
