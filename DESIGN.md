# Design System — MPS Alimentos · Trufas Ocas

<!-- impeccable:design-schema 1 -->

Recorded from the shipped `index.html` (single-page Persuade surface). Warm artisanal
chocolatier world — the category canon, chosen by the client and executed at full craft
fidelity. Cream ground, elegant serif, gold + deep-chocolate palette, product photo as hero.

## Palette

| Role | Token | Value |
|------|-------|-------|
| Page ground | `--cream` | `#f6efe4` |
| Alt ground | `--cream-2` | `#efe6d6` |
| Primary text | `--ink` | `#2c2016` |
| Secondary text | `--muted` | `#6f5e49` |
| Deep chocolate (buttons, contact section, footer) | `--choc` | `#4a2f1c` |
| Gold accent (decorative, borders, hovers) | `--gold` | `#a9772f` |
| Gold — label text (AA contrast on cream) | `--gold-deep` | `#8a5e1f` |
| Gold — on dark surfaces | `--gold-2` | `#c69a54` |
| Hairline | `--line` | `#e0d3bd` |
| Photo plate (matches product photo bg) | `--photo-bg` | `#f3f3f2` |

Strategy: Restrained-warm — cream neutral ground with gold accent; deep chocolate owns the
contact region (dark section for contrast and a strong close). Light theme only — the use
scene is a daytime professional buyer scanning a supplier; no dark mode.

## Typography

- **Display / brand / spec values / captions:** Petrona (serif), weights 500–700, with true
  italic used for emphasis accents (`Ocas`, `O recheio é seu`, section verbs). Google Fonts.
- **Body / UI / labels:** Hanken Grotesk, 400–600. Google Fonts.
- Scale: h1 `clamp(3rem,7vw,5.6rem)`, section h2 `clamp(2rem,4.5–5vw,3.2rem)`, spec values 2rem,
  body 1.1–1.12rem. Tracking on display `-.02em`, line-height .98–1.1.
- No eyebrow/kicker above headings (deliberately removed — craft floor ban).

## Components

- **Buttons:** pill (`border-radius:40px`). Primary = deep chocolate fill + soft offset shadow;
  ghost = 1px hairline border on translucent white. Hover lifts 2px.
- **Product plate:** rounded card (`14px`) with background equal to the photo's own background
  (`--photo-bg`) so the photo's box edge is seamless — chocolates read clean, no blend-mode
  trick. Soft large-offset shadow + 1px inset highlight + warm radial halo behind.
- **Spec strip:** single translucent-white rounded container, 4 equal centered cells split by
  1px hairlines; collapses 4→2→1 columns. Label (gold-deep, uppercase, tracked) over serif value
  over muted unit.
- **Contact cards (`.chan`):** deep-chocolate section; bordered rounded links with circular icon
  badge, label + value; hover lifts and warms border/icon. Flex row → column on mobile.
- **Icons:** authored inline SVG (WhatsApp glyph filled; e-mail line icon), single consistent weight.

## Motion

One authored entrance: hero content and photo rise-and-fade in on load (`riseIn`, exponential
ease-out, staggered .09s). Everything else is hover-only (2px lift, color/border). Fully disabled
under `prefers-reduced-motion`.

## Layout & Responsive

- Max width 1100px, 28px gutters. Hero is a 2-col grid (copy | photo) → stacks under 860px.
- Contact channels wrap; email value uses `overflow-wrap:anywhere` + flex `min-width:0` so the
  address never overflows on narrow screens.
- Verified: no horizontal overflow at 1100px or 375px.

## Content & Facts (from PRODUCT.md — do not fabricate beyond these)

- Product: Trufas Ocas — cascas de chocolate nacional ao leite, prontas para rechear.
- Spec: Ø 25 mm · 3,5–4 g/un · caixa com 126 unidades.
- Contact: WhatsApp (41) 98850-6691 (`wa.me/5541988506691`, pre-filled message) · e-mail
  joao@mpsalimentos.com. Domain: mpsalimentos.com.
- Single asset: `assets/trufas-ocas.png` (374×302, opaque light-gray bg).

## Notes for future work

- If a second product is added, the spec strip and hero pattern generalize to a product card grid;
  keep one product per section or introduce a light catalog while preserving this world.
- Photo is low resolution (374×302); a higher-res product shot would sharpen the hero.
- No logo yet — brand is set in Petrona wordmark ("MPS Alimentos"). A real logo can replace it.
